export const safeUser = "id,name,email,hostel_name,block,role,created_at";
export const listingSelect = `SELECT l.*,c.name AS category,u.name AS seller_name FROM listings l JOIN categories c ON c.id=l.category_id JOIN users u ON u.id=l.seller_id`;
