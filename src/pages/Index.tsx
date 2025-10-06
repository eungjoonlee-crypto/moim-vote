import { Hero } from "@/components/Hero";
import { ContestantCard } from "@/components/ContestantCard";

const contestants = [
  {
    id: "1",
    name: "김민준",
    song: "Can't Help Falling in Love - Elvis Presley",
    youtubeId: "vGJTaP6anOU",
    views: 15420,
    likes: 892,
  },
  {
    id: "2",
    name: "이서연",
    song: "Someone Like You - Adele",
    youtubeId: "hLQl3WQQoQ0",
    views: 23150,
    likes: 1456,
  },
  {
    id: "3",
    name: "박준호",
    song: "I Will Always Love You - Whitney Houston",
    youtubeId: "3JWTaaS7LdU",
    views: 18730,
    likes: 1124,
  },
  {
    id: "4",
    name: "최유나",
    song: "Shallow - Lady Gaga & Bradley Cooper",
    youtubeId: "bo_efYhYU2A",
    views: 31240,
    likes: 2103,
  },
  {
    id: "5",
    name: "정태양",
    song: "Bohemian Rhapsody - Queen",
    youtubeId: "fJ9rUzIMcZQ",
    views: 27890,
    likes: 1876,
  },
  {
    id: "6",
    name: "강하늘",
    song: "All of Me - John Legend",
    youtubeId: "450p7goxZqg",
    views: 19560,
    likes: 1289,
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      
      <main className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-foreground">
            참가자 무대
          </h2>
          <p className="text-muted-foreground text-lg">
            각 참가자의 영상을 시청하고 응원 댓글을 남겨주세요
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {contestants.map((contestant) => (
            <ContestantCard key={contestant.id} {...contestant} />
          ))}
        </div>
      </main>

      <footer className="border-t border-border/50 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>© 2025 Voice of Tomorrow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
