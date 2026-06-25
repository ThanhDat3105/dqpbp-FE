import { FlowOption } from "./chat-flow-data";

interface Props {
  options: FlowOption[];
  onSelect: (option: FlowOption) => void;
}

export function ChatQuickOptions({ options, onSelect }: Props) {
  if (options.length === 0) return null;

  return (
    <div className="px-3 pt-2 pb-1 flex gap-1.5 flex-wrap bg-white border-t border-gray-100">
      {options.map((opt) => (
        <button
          key={opt.label}
          onClick={() => onSelect(opt)}
          className="text-xs border border-[#546a2f]/30 text-[#546a2f] px-2.5 py-1 rounded-full hover:bg-[#546a2f]/5 transition-colors mb-1"
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
