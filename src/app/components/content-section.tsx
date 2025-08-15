import { ContentCard } from "./content-card";

const contents = [
  {
    title: "Bitcoin",
    description: "lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    title: "Ethereum",
    description: "lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    title: "Solana",
    description: "lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    title: "XRP",
    description:
      "lorem ipsum dolor sit amet, da, necessitatibus ratione itaque quidems omnis?.",
  },
];

export function ContentSection() {
  return (
    <section
      id="conteudo"
      className=" rounded-2xl sm:mx-5 py-20 px-4 sm:px-6 md:px-10"
    >
      <div className="max-w-full mx-auto sm:px-6 md:px-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {contents.map((item) => (
          <ContentCard
            key={item.title}
            title={item.title}
            description={item.description}
          />
        ))}
      </div>
    </section>
  );
}
