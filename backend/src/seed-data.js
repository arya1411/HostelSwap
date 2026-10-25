import bcrypt from "bcryptjs";
export async function seed(db) {
  const domain = (process.env.COLLEGE_EMAIL_DOMAINS || "college.edu")
    .split(",")[0]
    .trim();
  const password = process.env.DEMO_PASSWORD;
  if (!password || password.length < 10)
    throw new Error("DEMO_PASSWORD must contain at least 10 characters");
  const hash = await bcrypt.hash(password, 12);
  const names = ["Aarav Sharma", "Ananya Rao", "Rohan Mehta", "Ishita Singh"];
  for (let i = 0; i < names.length; i++)
    await db.query(
      `INSERT INTO users(name,email,password_hash,hostel_name,block,role) VALUES($1,$2,$3,'Vindhya Hostel',$4,$5) ON CONFLICT(email) DO NOTHING`,
      [
        names[i],
        `${["aarav", "ananya", "rohan", "admin"][i]}@${domain}`,
        hash,
        ["A", "B", "C", "A"][i],
        i === 3 ? "admin" : "student",
      ],
    );
  const demo = [
    [
      "Casio fx-991EX Scientific Calculator",
      "Perfect companion for engineering maths. All functions work, with the original cover. Pick up after lectures.",
      650,
      1295,
      "Like New",
      "Electronics",
      "calculator.svg",
      0,
    ],
    [
      "The complete first-year book stack",
      "Engineering mathematics, physics and mechanics. Clean pages, a few helpful pencil notes. Selling as a set.",
      850,
      2400,
      "Good",
      "Textbooks",
      "books.svg",
      1,
    ],
    [
      "A little light for late-night ideas",
      "Warm LED desk lamp with adjustable arm. Three brightness modes and a compact base for your study table.",
      450,
      999,
      "Like New",
      "Room Essentials",
      "lamp.svg",
      2,
    ],
    [
      "Your next campus ride",
      "Decathlon single-speed city cycle. Recently serviced brakes, smooth tyres, and a lock included.",
      3200,
      6999,
      "Good",
      "Cycles",
      "cycle.svg",
      0,
    ],
    [
      "Sony headphones, study mode on",
      "Comfortable over-ear wired headphones with clear sound. Great for lectures, music and long study sessions.",
      1200,
      2499,
      "Like New",
      "Electronics",
      "headphones.svg",
      1,
    ],
    [
      "Yonex badminton racket + cover",
      "Lightweight racket with fresh grip. Ready for evening matches at the hostel court. Cover included.",
      700,
      1599,
      "Good",
      "Sports & Fitness",
      "racket.svg",
      2,
    ],
    [
      "Make room for everything",
      "Set of two sturdy storage boxes. Fits neatly under a hostel bed. Clean and ready for pickup.",
      300,
      799,
      "Good",
      "Room Essentials",
      "storage.svg",
      1,
    ],
    [
      "Engineering drawing essentials",
      "Drawing board, mini drafter, compass and set squares. Everything you need for your first semester.",
      550,
      1400,
      "Fair",
      "Other",
      "drawing.svg",
      0,
    ],
  ];
  for (const [
    title,
    description,
    price,
    original,
    condition,
    category,
    image,
    seller,
  ] of demo) {
    await db.query(
      `INSERT INTO listings(seller_id,category_id,title,description,price,original_price,condition,image_path,hostel_name,block,created_at) SELECT u.id,c.id,$1::varchar(120),$2::text,$3::numeric,$4::numeric,$5::varchar(15),$6::text,u.hostel_name,u.block,now()-($9::integer * interval '3 hours') FROM users u,categories c WHERE u.email=$7 AND c.name=$8 AND NOT EXISTS(SELECT 1 FROM listings WHERE title=$1 AND seller_id=u.id)`,
      [
        title,
        description,
        price,
        original,
        condition,
        `/demo/${image}`,
        `${["aarav", "ananya", "rohan"][seller]}@${domain}`,
        category,
        demo.findIndex((x) => x[0] === title),
      ],
    );
  }
}
