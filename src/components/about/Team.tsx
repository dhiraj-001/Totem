import { useState, useEffect } from 'react';

interface TeamMember {
  profileUrl: string;
  name: string;
  designation: string;
}

const Team = () => {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await fetch('https://totem-consultancy-alpha.vercel.app/api/team');
        if (!response.ok) {
          throw new Error('Failed to fetch team data');
        }
        const data: TeamMember[] = await response.json();
        setTeam(data);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setIsLoading(false);
      }
    };

    fetchTeam();
  }, []);

  if (isLoading) {
    return (
      <section className="py-8 md:py-16 bg-[#faf9f6]">
        <div className="container mx-auto px-4 max-w-[824px]">
          <p className="text-center">Loading team members...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8 md:py-16 bg-[#faf9f6]">
        <div className="container mx-auto px-4 max-w-[824px]">
          <p className="text-center text-red-500">Error: {error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 md:py-16 bg-[#faf9f6]">
      <div className="container mx-auto px-4 max-w-[824px] bg-[#faf9f6]">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">
          Meet Our Team
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {team.map((member, index) => (
            <div key={index} className="text-center">
              <img
                src={member.profileUrl}
                alt={member.name}
                className="w-[140px] md:w-[191px] h-[140px] md:h-[191px] mx-auto mb-4 object-cover rounded-lg"
              />
              <h3 className="font-semibold w-full md:w-[191px] h-auto md:h-[29px]">
                {member.name}
              </h3>
              <p className="text-gray-600">{member.designation}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;