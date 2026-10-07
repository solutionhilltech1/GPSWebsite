// Splits text into word spans so ScrollFX can light them up one by one while scrolling.
export default function Words({ text, className }: { text: string; className?: string }) {
  return (
    <p className={className} data-words>
      {text.split(" ").map((word, i) => (
        <span key={i}>{word} </span>
      ))}
    </p>
  );
}
