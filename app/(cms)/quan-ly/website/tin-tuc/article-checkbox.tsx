export function CustomCheckbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      onClick={() => onChange(!checked)}
      className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${
        checked
          ? "bg-[#546a2f] border-[#546a2f]"
          : "border-gray-300 hover:border-[#546a2f]"
      }`}
    >
      {checked && (
        <svg
          viewBox="0 0 12 10"
          className="w-3 h-3 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="1,5 4,9 11,1" />
        </svg>
      )}
    </div>
  );
}
