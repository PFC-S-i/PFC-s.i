"use client";

type ContentCardProps = {
  title: string;
  description: string;
};

export function ContentCard({ title, description }: ContentCardProps) {
  return (
    <div className=" p-6 rounded-xl shadow-md">
      <h3 className="font-bold text-xl mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
