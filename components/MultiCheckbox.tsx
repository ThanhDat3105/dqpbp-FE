import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

interface Props {
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
  selected: string[];
}

export default function MultiCheckbox({ setSelected, selected }: Props) {
  const handleChange = (value: string) => {
    setSelected((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value],
    );
  };

  return (
    <FormGroup className="flex-row! gap-3">
      <FormControlLabel
        control={
          <Checkbox
            checked={selected.includes("pending")}
            onChange={() => handleChange("pending")}
          />
        }
        label={
          <span className="flex items-center gap-2 px-2 py-1 font-bold rounded-full text-sm bg-yellow-100 text-yellow-600">
            <span className="w-2 h-2 rounded-full bg-yellow-600"></span>
            Chưa bắt đầu
          </span>
        }
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={selected.includes("in_progress")}
            onChange={() => handleChange("in_progress")}
          />
        }
        label={
          <span className="flex items-center gap-2 px-2 py-1 font-bold rounded-full text-sm bg-blue-100 text-blue-600">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            Đang thực hiện
          </span>
        }
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={selected.includes("completed")}
            onChange={() => handleChange("completed")}
          />
        }
        label={
          <span className="flex items-center gap-2 px-2 py-1 font-bold rounded-full text-sm bg-green-100 text-green-600">
            <span className="w-2 h-2 rounded-full bg-green-600"></span>
            Hoàn thành
          </span>
        }
      />
    </FormGroup>
  );
}
