const teamMembers = [
  {
    name: "Andrea Miotti",
    title: "Project Lead",
    avatar: "/team-andrea.jpg",
  },
  {
    name: "Nathan Young",
    title: "Web Development",
    avatar: "/team-nathan.jpg",
  },
];

/**
 * NOT BEING USED!
 */
export default function AboutPage() {
  return (
    <div>
      <style>{`body { background: url(/bg.png) white no-repeat; background-color: white !important; }`}</style>

      <div className="flex flex-col sm:container sm:mx-auto">
        <div className="flex flex-col mb-32">
          <h1 className="text-[#101828] text-8xl font-semibold mt-20 mb-8">About us</h1>

          <div className="w-2/3">
            <p className="font-normal text-[#101828] mt-8">There are many discussions about AI. It feels repetitive.</p>
            <p className="font-normal text-[#101828] mt-8">AI good, AI bad. P(doom). Regulate. Accelerate.</p>
            <p className="font-normal text-[#101828] mt-8">We want to know what AI leaders actually think.</p>
            <p className="font-normal text-[#101828] mt-8">
              When will over 50% of people be using AI tools in their jobs?
            </p>
            <p className="font-normal text-[#101828] mt-8">
              Are there large risks from the next generation of AI models?
            </p>
            <p className="font-normal text-[#101828] mt-8">Should we implement Responsible Scaling Policies?</p>
            <p className="font-normal text-[#101828] mt-8">
              We have combed through public statements and found the answers, or our best guess, to these questions.
              We’ve labelled what is a clear answer, what is a related statement and what is our best guess. Where we
              can make no guess, we haven’t.
            </p>
            <p className="font-normal text-[#101828] mt-8">
              Hopefully this will allow you to see the agreement and disagreement in discussions of AI.
            </p>
          </div>
        </div>

        <div className="mb-40">
          <h3 className="font-semibold text-4xl">Team</h3>
          <ul className="flex space-x-20">
            {teamMembers.map((member) => (
              <li className="flex flex-col justify-start items-center py-10" key={member.name}>
                <div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={member.avatar} className="w-24 h-24 rounded-full" alt={member.name} />
                </div>
                <div className="mt-2 w-[180px] text-center">
                  <h4 className="font-semibold text-lg">{member.name}</h4>
                  <p className="font-normal text-[#101828] mt-1 text-sm">{member.title}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
