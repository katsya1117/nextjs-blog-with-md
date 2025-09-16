import { parseISO, format } from "date-fns";
import { ja } from "date-fns/locale";

// Propsの型を定義
type DateProps = {
  dateString: string;
};

export default function Date({ dateString }: DateProps) {
  if (!dateString) {
    return null;
  }
  const date = parseISO(dateString);
  return <time dateTime={dateString}>{format(date, "PPP", { locale: ja })}</time>
};
