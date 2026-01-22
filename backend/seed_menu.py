import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

# Database connection parameters
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_NAME = os.getenv("DB_NAME", "restaurant_db")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASS = os.getenv("DB_PASSWORD", "postgres") # Changed from DB_PASS to DB_PASSWORD based on previous turns
DB_PORT = os.getenv("DB_PORT", "5432")

def get_db_connection():
    return psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASS,
        port=DB_PORT
    )

def seed_menu():
    print("Connecting to database...")
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        print("Clearing existing menu data...")
        cur.execute("TRUNCATE TABLE order_items CASCADE;")
        cur.execute("TRUNCATE TABLE menu_items CASCADE;")
        cur.execute("TRUNCATE TABLE categories CASCADE;")
        
        categories = [
            ("Appetizers", 1),
            ("Salads", 2),
            ("Main Course", 3),
            ("Burgers & Sandwiches", 4),
            ("Pizza & Pasta", 5),
            ("Desserts", 6),
            ("Beverages", 7)
        ]
        
        cat_ids = {}
        
        print("Seeding Categories...")
        for name, order in categories:
            cur.execute(
                "INSERT INTO categories (name, display_order) VALUES (%s, %s) RETURNING id;",
                (name, order)
            )
            cat_ids[name] = cur.fetchone()[0]
            
        menu_items = [
            # Appetizers
            ("Crispy Calamari", "Appetizers", "Golden fried squid rings served with marinara sauce and lemon wedge.", 14.99, "https://images.unsplash.com/photo-1599488615731-7e512819a22f?q=80&w=600&auto=format&fit=crop"),
            ("Loaded Nachos", "Appetizers", "Tortilla chips topped with melted cheese, jalapeños, salsa, guacamole, and sour cream.", 12.99, "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?q=80&w=600&auto=format&fit=crop"),
            ("Buffalo Wings", "Appetizers", "Spicy chicken wings served with celery sticks and blue cheese dip.", 13.50, "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?q=80&w=600&auto=format&fit=crop"),
            ("Bruschetta", "Appetizers", "Toasted baguette slices topped with fresh tomatoes, basil, garlic, and balsamic glaze.", 10.99, "https://images.unsplash.com/photo-1572695157363-bc31c5d55b86?q=80&w=600&auto=format&fit=crop"),

            # Salads
            ("Classic Caesar", "Salads", "Romaine lettuce, parmesan cheese, croutons, and Caesar dressing.", 11.99, "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?q=80&w=600&auto=format&fit=crop"),
            ("Greek Salad", "Salads", "Cucumbers, tomatoes, kalamata olives, feta cheese, and red onion with oregano dressing.", 12.50, "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=600&auto=format&fit=crop"),
            ("Cobb Salad", "Salads", "Grilled chicken, avocado, bacon, boiled egg, blue cheese, and tomato on mixed greens.", 15.99, "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop"),

            # Main Course
            ("Grilled Ribeye Steak", "Main Course", "12oz Ribeye steak grilled to perfection, served with mashed potatoes and seasonal vegetables.", 34.99, "https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=600&auto=format&fit=crop"),
            ("Pan-Seared Salmon", "Main Course", "Fresh Atlantic salmon fillet with lemon butter sauce, served with wild rice and asparagus.", 26.99, "https://images.unsplash.com/photo-1467003909585-2f8a7270028d?q=80&w=600&auto=format&fit=crop"),
            ("Chicken Parmesan", "Main Course", "Breaded chicken breast topped with marinara sauce and melted mozzarella, served over spaghetti.", 21.99, "https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?q=80&w=600&auto=format&fit=crop"),
            ("BBQ Baby Back Ribs", "Main Course", "Slow-cooked pork ribs smothered in house BBQ sauce, served with coleslaw and fries.", 28.99, "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop"),

            # Burgers & Sandwiches
            ("Classic Cheeseburger", "Burgers & Sandwiches", "Juicy beef patty, cheddar cheese, lettuce, tomato, and house sauce on a brioche bun.", 14.99, "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop"),
            ("Mushroom Swiss Burger", "Burgers & Sandwiches", "Beef patty topped with sautéed mushrooms and melted Swiss cheese.", 15.99, "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=600&auto=format&fit=crop"),
            ("Crispy Chicken Sandwich", "Burgers & Sandwiches", "Fried chicken breast with pickles, coleslaw, and spicy mayo on a toasted bun.", 13.99, "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=600&auto=format&fit=crop"),

            # Pizza & Pasta
            ("Margherita Pizza", "Pizza & Pasta", "San Marzano tomato sauce, fresh mozzarella, basil, and olive oil.", 16.99, "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=600&auto=format&fit=crop"),
            ("Pepperoni Feast", "Pizza & Pasta", "Loaded with pepperoni slices and extra mozzarella cheese.", 18.99, "https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=600&auto=format&fit=crop"),
            ("Fettuccine Alfredo", "Pizza & Pasta", "Creamy parmesan sauce tossed with fettuccine pasta.", 17.99, "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?q=80&w=600&auto=format&fit=crop"),

            # Desserts
            ("New York Cheesecake", "Desserts", "Rich and creamy cheesecake with a graham cracker crust and strawberry topping.", 8.99, "https://images.unsplash.com/photo-1524351199678-941a58a3df50?q=80&w=600&auto=format&fit=crop"),
            ("Chocolate Lava Cake", "Desserts", "Warm chocolate cake with a molten center, served with vanilla ice cream.", 9.99, "https://images.unsplash.com/photo-1606313564200-e75d5e30476d?q=80&w=600&auto=format&fit=crop"),
            ("Tiramisu", "Desserts", "Classic Italian dessert with espresso-soaked ladyfingers and mascarpone cream.", 9.50, "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=600&auto=format&fit=crop"),

            # Beverages
            ("Craft Lemonade", "Beverages", "Freshly squeezed lemonade with a hint of mint.", 4.99, "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop"),
            ("Iced Tea", "Beverages", "Fresh brewed black tea served over ice with lemon.", 3.99, "https://images.unsplash.com/photo-1499638673689-79a0b5115d87?q=80&w=600&auto=format&fit=crop"),
            ("Soft Drinks", "Beverages", "Coke, Diet Coke, Sprite, or Fanta.", 2.99, "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=600&auto=format&fit=crop"),
        ]
        
        print("Seeding Menu Items...")
        for name, cat_name, desc, price, img in menu_items:
            cat_id = cat_ids.get(cat_name)
            if cat_id:
                cur.execute(
                    """
                    INSERT INTO menu_items (category_id, name, description, price, image_url, is_active)
                    VALUES (%s, %s, %s, %s, %s, TRUE)
                    """,
                    (cat_id, name, desc, price, img)
                )
        
        conn.commit()
        print("Menu seeded successfully with real restaurant data!")
        
    except Exception as e:
        print(f"Error seeding menu: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    seed_menu()
