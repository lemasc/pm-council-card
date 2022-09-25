type Sections =
  | "ประธานนักเรียน"
  | "เลขานุการ"
  | "ฝ่ายกิจการนักเรียน"
  | "ฝ่ายกีฬาและนันทนาการ"
  | "ฝ่ายเทคโนโลยีสารสนเทศ"
  | "ฝ่ายวิชาการ"
  | "ฝ่ายสิ่งแวดล้อม";

type Source = {
  nametitle: string;
  name: string;
  surname: string;
  section: Sections;
  role: "กรรมการ" | "ประธานนักเรียน" | "รองประธาน";
};

export type { Sections, Source };
