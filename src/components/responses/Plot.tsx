"use client";

import { Respondent, Response } from "@/db/schema";
import { QuestionType, ResponsesType } from "kysely-codegen";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import debounce from "lodash.debounce";
import { inter } from "@/utils/constants";
import dayjs from "dayjs";
import { findNearestProbability } from "@/lib/namedProbabilities";

const NODE_RADIUS = 18;
const ACTIVE_RADIUS = 58 / 2;
const DRAW_HEIGHT = 175;
const PAD_BOTTOM = 30;
const SVG_HEIGHT = DRAW_HEIGHT + PAD_BOTTOM;
const TRANSITION_DURATION = 900;
const LINE_COLOR = "#E5E9EF";
const BORDER_COLOR = "#E5E5E5";

const imgPosition = -NODE_RADIUS;
const imgSize = NODE_RADIUS * 2;
const activeImgPosition = -ACTIVE_RADIUS;
const activeImgSize = ACTIVE_RADIUS * 2;

type ResponsesPlotNode = {
  x: number;
  y: number;
  certainty: ResponsesType;
  name: string;
  avatarUrl: string;
  id: number;
  radius: number;
  active: boolean;
  value: number;
  date?: Date;
};

export function Plot({
  responses: _responses,
  activeId,
  respondentsMap,
  setCurrentResponse,
  hidden,
  questionType,
}: {
  responses: Response[];
  activeId: number;
  respondentsMap: Record<number, Respondent>;
  setCurrentResponse: (id: number) => void;
  /**
   * An array of response id's that should be made transparent
   */
  hidden: number[];
  questionType: QuestionType;
}) {
  const [responses] = useState(() => {
    return _responses.sort((a, b) => a.value - b.value);
  });

  const d3Container = useRef<SVGSVGElement>(null);
  const [initialized, setInitialized] = useState(false);
  const [initialPositions, setInitialPositions] = useState<ResponsesPlotNode[]>([]);
  const [width, setWidth] = useState<number | null>(null);
  const resize = useCallback((newWidth: number) => {
    setInitialized(false);
    setWidth(newWidth);
  }, []);
  const resizeDebounce = useMemo(() => debounce(resize, 100), [resize]);

  const observer = useRef<ResizeObserver | null>(null);

  // Helper utilities which allow us to choose the right x
  // and get the right label depending on the question type
  const utils = useMemo(() => {
    if (questionType == "date") {
      // get the min and max dates
      const { min, max } = responses.reduce(
        (acc, response) => {
          // convert date to timestamp
          const date = response.response_date.getTime();
          if (date < acc.min) acc.min = date;
          if (date > acc.max) acc.max = date;
          return acc;
        },
        { min: Infinity, max: -Infinity },
      );

      // First find the full range
      const range = max - min;

      // If the range is more than 4 years, we will mark every year. Otherwise, we will mark every month.
      const byMonth = range <= 1000 * 60 * 60 * 24 * 365 * 4;

      // get the array of timestamps
      let rawTimestamps = byMonth ? getMonths(min, max) : getYears(min, max);

      // filter any timestamps lower than the min or higher than the max
      rawTimestamps = rawTimestamps.filter((timestamp) => timestamp >= min && timestamp <= max);

      // map the timestamps to percentages and remove any under 0 or over 100
      const timestamps = rawTimestamps.map((timestamp) => {
        const percentage = ((timestamp - min) / range) * 100;
        return percentage;
      });

      const timestampLabels = getTimestampLabels(rawTimestamps, byMonth);

      const getPercentage = (date: Date) => {
        return ((date.getTime() - min) / range) * 100;
      };

      return {
        type: questionType,
        min,
        max,
        range,
        getPercentage,
        label: (node: ResponsesPlotNode) => {
          return dayjs(node.date).format("YYYY MMM");
        },
        getX: (_value: number, date?: Date) => {
          if (!date) throw new Error("Date is required for date question type");
          return getPercentage(date!);
        },
        timestamps,
        timestampLabels,
      };
    }

    if (questionType == "descriptive") {
      return {
        type: questionType,
        label: (node: ResponsesPlotNode) => findNearestProbability(node.value),
        getX: (value: number, _date?: Date) => value,
      };
    }

    return {
      type: questionType,
      label: (node: ResponsesPlotNode) => `${node.value}%`,
      getX: (value: number, _date?: Date) => value,
    };
  }, [questionType, responses]);

  const onNodeMouseEnter = useCallback(
    (node: ResponsesPlotNode) => {
      // do nothing for the active node
      // if (node.active) return;

      if (!d3Container.current) return;
      const svg = d3.select(d3Container.current);

      // remove any existing tooltips that don't have the [data-is-active] attribute = true
      // svg.selectAll(".active-title-group[data-is-active=false]").remove();
      svg.selectAll(".active-title-group").remove();

      createTextElement({
        svg,
        text: node.name,
        position: "top",
        x: node.x,
        y: node.y,
        isActive: false,
      });
      createTextElement({
        svg,
        text: utils.label(node),
        position: "bottom",
        x: node.x,
        y: node.y,
        isActive: false,
      });
    },
    [utils],
  );

  const onNodeMouseLeave = useCallback(() => {
    if (!d3Container.current) return;
    const svg = d3.select(d3Container.current);

    // remove any existing tooltips
    svg.selectAll(".active-title-group").remove();
  }, []);

  // Set initial width
  useEffect(() => {
    if (!width && d3Container.current && d3Container.current.parentElement) {
      setWidth(d3Container.current.parentElement?.getBoundingClientRect().width);
    }
  }, [width]);

  // Watch Width
  useEffect(() => {
    if (!d3Container.current) return;
    const d3ContainerParent = d3Container.current.parentElement;
    if (!d3ContainerParent) return;

    observer.current = new ResizeObserver((entries) => {
      for (const entry of entries) {
        resizeDebounce(entry.contentRect.width);
      }
    });
    observer.current.observe(d3ContainerParent);
    return () => {
      observer.current?.disconnect();
    };
  }, [resizeDebounce]);

  // Initialization to set default sizes
  useEffect(() => {
    if (initialized || !d3Container.current || width === null) return;

    const svg = d3.select(d3Container.current);

    // Set up your scales
    const xScale = createXScale(width);

    // Clear the SVG to re-render it on update
    svg.selectAll("*").remove();

    // Add Accent Lines & Axis Text Depending on Question Type
    switch (questionType) {
      case "percentage": {
        for (let i = 0; i <= 100; i += 5) {
          if (i % 10 === 0) {
            svg
              .append("line")
              .attr("x1", xScale(i))
              .attr("y1", 0)
              .attr("x2", xScale(i))
              .attr("y2", DRAW_HEIGHT) // Assuming the height of your SVG is 100
              .attr("stroke", LINE_COLOR) // Style as needed
              .attr("stroke-width", 2);
          }

          if (i % 50 === 0) {
            // Append text for the percentage
            svg
              .append("text")
              .attr("x", xScale(i)) // Position the text slightly to the right of the line
              .attr("y", SVG_HEIGHT) // Position the text at the bottom of the SVG
              .attr("dx", "0.35em")
              .attr("dy", "-0.35em") // Adjust the position slightly above the bottom edge
              .attr("text-anchor", "middle") // Center the text on the x position
              .style("font-family", inter.style.fontFamily)
              .style("font-size", "14px") // Set the font size
              .style("color", "#334553") // Set the text color
              .text(`${i}%`); // Set the text to the percentage value
          }
        }
        break;
      }
      case "descriptive": {
        for (let i = 0; i <= 100; i += 5) {
          if (i % 10 === 0) {
            svg
              .append("line")
              .attr("x1", xScale(i))
              .attr("y1", 0)
              .attr("x2", xScale(i))
              .attr("y2", DRAW_HEIGHT) // Assuming the height of your SVG is 100
              .attr("stroke", LINE_COLOR) // Style as needed
              .attr("stroke-width", 2);
          }

          if (i in descriptiveAxisText) {
            svg
              .append("text")
              .attr("x", xScale(i)) // Position the text slightly to the right of the line
              .attr("y", SVG_HEIGHT) // Position the text at the bottom of the SVG
              .attr("dx", i === 0 ? "1.75em" : i === 100 ? "-1.75em" : "0")
              .attr("dy", "-0.35em") // Adjust the position slightly above the bottom edge
              .attr("text-anchor", "middle")
              .style("font-family", inter.style.fontFamily)
              .style("font-size", "14px") // Set the font size
              .style("font-weight", "500")
              .style("color", "#334553") // Set the text color
              .text(descriptiveAxisText[i as keyof typeof descriptiveAxisText]); // Set the text to the percentage value
          }
        }
        break;
      }
      case "date": {
        if (!(utils.type === "date")) throw new Error("Invalid question type for date question type");
        let i = 0;
        for (const percentage of utils.timestamps) {
          svg
            .append("line")
            .attr("x1", xScale(percentage))
            .attr("y1", 0)
            .attr("x2", xScale(percentage))
            .attr("y2", DRAW_HEIGHT) // Assuming the height of your SVG is 100
            .attr("stroke", LINE_COLOR) // Style as needed
            .attr("stroke-width", 2);

          if (utils.timestampLabels[i]) {
            svg
              .append("text")
              .attr("x", xScale(percentage)) // Position the text slightly to the right of the line
              .attr("y", SVG_HEIGHT) // Position the text at the bottom of the SVG
              .attr("dy", "-0.35em") // Adjust the position slightly above the bottom edge
              .attr("text-anchor", "middle")
              .style("font-family", inter.style.fontFamily)
              .style("font-size", "14px") // Set the font size
              .style("color", "#334553") // Set the text color
              .text(utils.timestampLabels[i]); // Set the text to the percentage value
          }

          i++;
        }
        break;
      }
    }

    // Convert numbers to objects
    const nodes: ResponsesPlotNode[] = responses.map((response) => {
      const r = respondentsMap[response.respondent_id];
      if (!r) throw new Error(`Respondent not found for response ${response.id}`);

      return {
        x: utils.getX(response.value, response.response_date),
        y: DRAW_HEIGHT / 2, // All nodes begin vertically centered
        certainty: response.type,
        id: response.id,
        name: r.name,
        avatarUrl: r.avatar_url ?? "",
        radius: NODE_RADIUS,
        active: response.id === activeId,
        value: response.value,
        date: response.response_date,
      };
    });

    // Update the force simulation with the dynamic collision radius
    const simulation = getSimulation(nodes, width, xScale);

    // Manually run the simulation to completion in a tight loop
    for (let i = 0; i < 240; ++i) simulation.tick();

    // Save the initial positions for later
    setInitialPositions(nodes);

    // After the simulation, use the updated positions to set the elements
    const buttonGroup = svg
      .selectAll("g.button")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", (d) => `graph-button ${d.certainty}`)
      .attr("data-id", (d) => d.id)
      .attr("cursor", "pointer")
      .attr("tabindex", 0)
      .attr("transform", (d) => `translate(${d.x},${d.y})`)
      .on("click", (_, d) => {
        setCurrentResponse(d.id);
      })
      .on("mouseenter", (_, d) => {
        onNodeMouseEnter(d);
      });

    buttonGroup
      .append("image")
      .attr("href", (d) => d.avatarUrl)
      .attr("x", imgPosition)
      .attr("y", imgPosition)
      .attr("width", imgSize)
      .attr("height", imgSize)
      .attr("preserveAspectRatio", "xMidYMid slice")
      .style("clip-path", "inset(0% round 50%)");

    svg
      .append("filter")
      .attr("id", "shadow")
      // prevent it from being clipped
      .attr("x", "-50%")
      .attr("y", "-100%")
      .attr("width", "200%")
      .attr("height", "300%")
      .append("feDropShadow")
      .attr("dx", 0)
      .attr("dy", 4)
      .attr("stdDeviation", 6)
      .attr("flood-color", "rgba(0, 0, 0, 0.1)")
      .attr("flood-opacity", 1);

    setInitialized(true);

    return () => {};
  }, [
    activeId,
    initialized,
    onNodeMouseEnter,
    questionType,
    respondentsMap,
    responses,
    setCurrentResponse,
    utils,
    width,
  ]); // Redraw graph when numbers change

  // useEffect to handle changing hidden id's, making them transparent using data-id attribute
  useEffect(() => {
    if (!d3Container.current) return;
    const svg = d3.select(d3Container.current);

    // Update the hidden nodes
    svg
      .selectAll(".graph-button")
      .data(initialPositions)
      .attr("data-is-hidden", (d) => hidden.includes(d.id));
  }, [hidden, initialPositions]);

  // Separate useEffect to handle adjusting the size of the active element
  useEffect(() => {
    if (!d3Container.current || width === null) return;
    const svg = d3.select(d3Container.current);

    if (!initialized || initialPositions.length === 0) return;

    // Use the stored initial positions as the starting point for the simulation
    const updatedNodes = initialPositions.map((node, index) => {
      const isActive = activeId === responses[index].id;

      return {
        ...node,
        // Set the radius based on active status
        radius: isActive ? ACTIVE_RADIUS : NODE_RADIUS,
        active: isActive,
      };
    });

    // Re-initialize the simulation
    const simulation = d3
      .forceSimulation(updatedNodes)
      .force("x", d3.forceX((d: ResponsesPlotNode) => d.x).strength(1))
      // .force("y", d3.forceY(DRAW_HEIGHT / 2).strength(0.1))
      .force("collide", d3.forceCollide((d: ResponsesPlotNode) => d.radius).strength(1.1))
      // .force("charge", d3.forceManyBody().strength(-30)) // Add repulsive force
      // add container bounds to prevent nodes from escaping
      .force("bounds", () => {
        for (const node of updatedNodes) {
          const r = node.radius;
          node.x = Math.max(r, Math.min(width - r, node.x));
          node.y = Math.max(r, Math.min(DRAW_HEIGHT - r, node.y));
        }
      })
      .stop();

    // Manually run the simulation to completion in a tight loop
    for (let i = 0; i < 240; ++i) simulation.tick();

    // Update the positions and sizes of the nodes after the simulation
    svg
      .selectAll(".graph-button")
      .data(updatedNodes)
      .transition()
      .duration(TRANSITION_DURATION)
      .ease(d3.easeElastic.period(0.5))
      .attr("transform", (d) => `translate(${d.x},${d.y})`)
      .attr("data-is-active", (d) => d.active);

    svg
      .selectAll(".graph-button circle")
      .data(updatedNodes)
      .transition()
      .duration(TRANSITION_DURATION)
      .ease(d3.easeElastic.period(0.5))
      .attr("r", (d) => d.radius);

    svg
      .selectAll(".graph-button image")
      .data(updatedNodes)
      .transition()
      .duration(TRANSITION_DURATION)
      .ease(d3.easeElastic.period(0.5))
      .attr("x", (d) => (d.active ? activeImgPosition : imgPosition))
      .attr("y", (d) => (d.active ? activeImgPosition : imgPosition))
      .attr("width", (d) => (d.active ? activeImgSize : imgSize))
      .attr("height", (d) => (d.active ? activeImgSize : imgSize));

    // get active node, exit if not found
    const activeNode = updatedNodes.find((node) => node.active);
    if (!activeNode) return;

    // Fade out old text elements
    svg
      .selectAll(".active-title-group")
      // .transition()
      // .duration(TRANSITION_DURATION / 6)
      .style("opacity", 0)
      .remove();

    // bind the mouseLeave handler
    svg.on("mouseleave", onNodeMouseLeave);

    return () => {};
  }, [activeId, initialPositions, initialized, onNodeMouseLeave, questionType, responses, utils, width]);

  return <svg className="graph relative z-10" height={SVG_HEIGHT} width="100%" ref={d3Container} />;
}

function createXScale(width: number) {
  return d3
    .scaleLinear()
    .domain([0, 100])
    .range([NODE_RADIUS, width - NODE_RADIUS]);
}

function createTextElement({
  svg,
  text,
  position,
  x,
  y,
  isActive,
}: {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  text: string;
  position: "top" | "bottom";
  x: number;
  y: number;
  isActive: boolean;
}) {
  // Define padding around the text
  const paddingX = 12;
  const paddingY = 10;

  // Create a group to hold the rect and text together
  const textGroup = svg
    .append("g")
    .attr("class", "active-title-group")
    .attr("pointer-events", "none")
    .attr("data-is-active", isActive)
    .style("opacity", 0)
    .attr("transform", `translate(${x}, ${position === "top" ? y - ACTIVE_RADIUS - 20 : y + ACTIVE_RADIUS + 30})`);

  // Create and style the text element to calculate its size
  const textElement = textGroup
    .append("text")
    .attr("class", "active-title " + inter.className)
    .attr("dx", 0)
    .attr("dy", 0)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("fill", "#334553") // Use fill for text color in SVG
    .style("pointer-events", "none")
    .text(text);

  // Calculate the bounding box of the text element
  const bbox = textElement.node()!.getBBox();

  // Append a rect element behind the text
  textGroup
    .insert("rect", "text")
    .attr("x", bbox.x - paddingX)
    .attr("y", bbox.y - paddingY)
    .attr("width", bbox.width + paddingX * 2)
    .attr("height", bbox.height + paddingY * 2)
    .attr("rx", 8)
    .attr("stroke", BORDER_COLOR)
    .attr("stroke-width", 1)
    .attr("filter", "url(#shadow)")
    .attr("fill", "white")
    .style("pointer-events", "none");

  // Make sure the text is on top by re-appending it to the group
  textGroup.append(() => textElement.node());

  // Fade in new text element
  textGroup.style("opacity", 1);
}

const descriptiveAxisText = {
  0: "Very Unlikely",
  50: "About Even",
  100: "Almost Certain",
};

/**
 * Returns an array of month timestamps between the start and end timestamps
 */
function getMonths(startTimestamp: number, endTimestamp: number) {
  const months = [];

  const month = new Date(startTimestamp).getMonth();
  const year = new Date(startTimestamp).getFullYear();

  // create a new date object at the beginning of the month
  const current = new Date(year, month, 1);

  while (current.getTime() < endTimestamp) {
    months.push(current.getTime());
    current.setMonth(current.getMonth() + 1);
  }
  return months;
}

/**
 * Returns an array of year timestamps between the start and end timestamps
 */
function getYears(startTimestamp: number, endTimestamp: number) {
  const years = [];

  const year = new Date(startTimestamp).getFullYear();

  // create a new date object at the beginning of the year
  const current = new Date(year, 0, 1);

  while (current.getTime() < endTimestamp) {
    years.push(current.getTime());
    current.setFullYear(current.getFullYear() + 1);
  }
  return years;
}

/**
 * Returns an array with time labels for specific indices in the timestamps array
 * - If there are 5 or less timestamps, return all of them
 * - If there are more than 5 timestamps, return the first, last, and 3 evenly spaced timestamps in between
 */
function getTimestampLabels(timestamps: number[], byMonth: boolean) {
  if (timestamps.length <= 5)
    return timestamps.map((timestamp) => dayjs(timestamp).format(byMonth ? "YYYY MMM" : "YYYY"));

  const inc = (timestamps.length - 1) / 4;
  const indices = [0, 1, 2, 3, 4].map((i) => Math.round(i * inc));

  return timestamps.map((timestamp, i) =>
    indices.includes(i) ? dayjs(timestamp).format(byMonth ? "YYYY MMM" : "YYYY") : null,
  );
}

/**
 * Gets the simulation to run on the nodes
 */
function getSimulation(nodes: ResponsesPlotNode[], width: number, xScale?: d3.ScaleLinear<number, number>) {
  // Update the force simulation with the dynamic collision radius
  return (
    d3
      .forceSimulation(nodes)
      .force("x", d3.forceX((d: ResponsesPlotNode) => (xScale ? xScale(d.x) : d.x)).strength(1))
      // add a force which tries to keep nodes in the middle on y axis
      .force("y", d3.forceY(DRAW_HEIGHT / 2).strength(0.1))
      .force("collide", d3.forceCollide(NODE_RADIUS).strength(1))
      .force("charge", d3.forceManyBody().strength(-7)) // Add repulsive force
      .force("bounds", () => {
        for (const node of nodes) {
          const r = node.radius;
          node.x = Math.max(r, Math.min(width - r, node.x));
          node.y = Math.max(r, Math.min(DRAW_HEIGHT - r, node.y));
        }
      })
      .stop()
  );
}
