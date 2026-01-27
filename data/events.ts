export interface Event {
    id: number;
    title: string;
    date: string;
    time: string;
    location: string;
    description: string;
    type: "Workshop" | "Hackathon" | "Talk" | "Meetup";
    attendees: string;
    status: "Upcoming" | "Registration Open" | "Completed";
    image?: string;
    link?: string;
    dateObj: Date; // For proper date comparison
}

// Real events from FOSS United - College of Engineering Vadakara
export const events: Event[] = [
    {
        id: 1,
        title: "HackDay2026",
        date: "20 Jan 2026",
        dateObj: new Date("2026-01-20"),
        time: "Full Day Event",
        location: "Mini Auditorium, College Of Engineering Vadakara",
        description: "In collaboration with Major League Hacking (MLH), the FOSS Club CEV is organizing an exciting hackathon on 20 January 2026. This event brings together innovative minds to collaborate, build impactful solutions, and celebrate open-source technology in a competitive and creative environment.",
        type: "Hackathon",
        attendees: "100+",
        status: "Completed",
        link: "https://fossunited.org/c/college-of-engineering-vadakara/hackday"
    },
    {
        id: 2,
        title: "HALLOWS OF HACKING",
        date: "11 Jan 2026",
        dateObj: new Date("2026-01-11"),
        time: "Online Event",
        location: "ONLINE",
        description: "An online hacking event focused on cybersecurity challenges and ethical hacking practices. Join us to learn about security vulnerabilities and how to protect systems.",
        type: "Workshop",
        attendees: "150+",
        status: "Completed",
        link: "https://fossunited.org/c/college-of-engineering-vadakara/hallowsofhacking"
    },
    {
        id: 3,
        title: "AI & HER",
        date: "20 Dec 2025",
        dateObj: new Date("2025-12-20"),
        time: "Virtual Session",
        location: "Virtual",
        description: "A special session focusing on women in AI and technology. Exploring the intersection of artificial intelligence and gender diversity in tech.",
        type: "Talk",
        attendees: "80+",
        status: "Completed",
        link: "https://fossunited.org/c/college-of-engineering-vadakara/aiandher"
    },
    {
        id: 4,
        title: "code FORWARD: AI . Developer . Productivity",
        date: "2 Nov 2025",
        dateObj: new Date("2025-11-02"),
        time: "Online Session",
        location: "Google Meet",
        description: "Learn how AI tools are revolutionizing developer productivity. Discover the latest AI-powered development tools and techniques to enhance your coding workflow.",
        type: "Workshop",
        attendees: "120+",
        status: "Completed",
        link: "https://fossunited.org/c/college-of-engineering-vadakara/code-forward"
    },
    {
        id: 5,
        title: "FOSS CORNER - Evolvia",
        date: "8 Oct 2025",
        dateObj: new Date("2025-10-08"),
        time: "2:00 PM - 5:00 PM",
        location: "D111, MCA Block",
        description: "An interactive session about the evolution of FOSS and its impact on modern software development. Featuring discussions on open-source contributions and community building.",
        type: "Meetup",
        attendees: "50+",
        status: "Completed",
        link: "https://fossunited.org/c/college-of-engineering-vadakara/fosscorner-evolvia"
    },
    {
        id: 6,
        title: "Linux Installation Party",
        date: "6 Oct 2025",
        dateObj: new Date("2025-10-06"),
        time: "2:00 PM - 5:00 PM",
        location: "Tutorial Hall, College of Engineering Vadakara",
        description: "Bring your laptops! We will help you dual-boot Linux alongside Windows. Learn the basics of partitioning, drivers, and choosing the right distro for you.",
        type: "Workshop",
        attendees: "75+",
        status: "Completed",
        link: "https://fossunited.org/c/college-of-engineering-vadakara/linux-party"
    },
    {
        id: 7,
        title: "The Human Firewall: Your First and Last Line of Defense",
        date: "28 Sep 2025",
        dateObj: new Date("2025-09-28"),
        time: "Online Session",
        location: "Jitsi Platform",
        description: "A cybersecurity awareness session focusing on human factors in security. Learn how to be the first line of defense against cyber threats.",
        type: "Talk",
        attendees: "100+",
        status: "Completed",
        link: "https://fossunited.org/c/college-of-engineering-vadakara/cyber-awareness"
    },
    {
        id: 8,
        title: "Sit & Git",
        date: "19 Sep 2025",
        dateObj: new Date("2025-09-19"),
        time: "3:00 PM - 6:00 PM",
        location: "NOS LAB, College of Engineering Vadakara",
        description: "Stop emailing zip files! Learn version control, branching strategies, and how to make your first Pull Request. A hands-on Git workshop for beginners.",
        type: "Workshop",
        attendees: "60+",
        status: "Completed",
        link: "https://fossunited.org/c/college-of-engineering-vadakara/Sit&Git"
    },
    {
        id: 9,
        title: "Introducing FOSS - Open Doors to Open Source",
        date: "11 Sep 2025",
        dateObj: new Date("2025-09-11"),
        time: "4:00 PM - 6:00 PM",
        location: "Mini Auditorium, College Of Engineering Vadakara",
        description: "The inaugural event of FOSS Club CEV! An introduction to Free and Open Source Software, its philosophy, and how you can get started with open-source contributions.",
        type: "Talk",
        attendees: "200+",
        status: "Completed",
        link: "https://fossunited.org/c/college-of-engineering-vadakara/IntroducingFOSS-OpenDoorstoOpenSource"
    }
];

// Get upcoming events based on current date
export const getUpcomingEvents = () => {
    const now = new Date();
    return events.filter(event => event.dateObj > now);
};

// Get past events based on current date
export const getPastEvents = () => {
    const now = new Date();
    return events.filter(event => event.dateObj <= now);
};

// Get events sorted by date (newest first)
export const getEventsSortedByDate = () => {
    return [...events].sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
};
