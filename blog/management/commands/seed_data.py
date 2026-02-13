"""
Seed the site with 50 users, 50 articles, 50 chat messages, 50+ comments,
50 ratings, 50 tracking logs, tags, and uploaded files.
"""
import random
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User, Group
from django.core.files.base import ContentFile

from blog.models import (
    Article, Comment, Tag, ArticleRating, ChatMessage,
    SystemTrackingLog, UploadedFile
)

# Sample content for seeding (Hebrew + English)
TAGS = [
    "Technology", "News", "Programming", "Django", "React", "Python", "JavaScript",
    "Web Development", "DevOps", "Security", "AI", "Data Science", "בלוג", "מדיה"
]

ARTICLE_TITLES = [
    "Getting Started with Django REST Framework",
    "Introduction to React Hooks",
    "Python Best Practices in 2024",
    "Building APIs with FastAPI",
    "Understanding JavaScript Async/Await",
    "Docker for Beginners",
    "מדריך למתחילים בפיתוח ווב",
    "כיצד לבנות אפליקציה מודרנית",
    "The Future of Web Development",
    "Machine Learning Basics",
    "GraphQL vs REST: Which to Choose?",
    "Testing Your Django Applications",
    "CSS Grid and Flexbox Explained",
    "Database Optimization Tips",
    "Deploying to Production",
    "Git Workflow Best Practices",
    "TypeScript for JavaScript Developers",
    "שיפור ביצועים באתרים",
    "Authentication with JWT",
    "Microservices Architecture",
    "אבטחת מידע באפליקציות",
    "Cloud Computing Overview",
    "Node.js vs Python for Backend",
    "Introduction to Kubernetes",
    "Responsive Design Principles",
    "Clean Code Principles",
    "CI/CD Pipeline Setup",
    "טכנולוגיות חדשות בתעשייה",
    "REST API Design Guide",
    "Vue.js vs React Comparison",
    "Database Migrations Best Practices",
    "Error Handling in Python",
    "Frontend State Management",
    "עיצוב ממשקי משתמש",
    "API Security Best Practices",
    "Performance Monitoring Tools",
    "Mobile-First Development",
    "Serverless Architecture",
    "בלוג טכנולוגי – טיפים",
    "Code Review Guidelines",
    "Documentation Best Practices",
    "Design Patterns in Python",
    "Web Accessibility (a11y)",
    "אופטימיזציה למנועי חיפוש",
    "Agile Development Practices",
    "Database Indexing Explained",
    "Event-Driven Architecture",
    "Introduction to Blockchain",
    "DevOps Culture and Practices",
    "Full-Stack Development Roadmap",
]

ARTICLE_CONTENT_SNIPPETS = [
    "This article explores the fundamentals and provides practical examples.",
    "In this guide, we will cover the essential concepts and walk through real-world use cases.",
    "למד את היסודות והתחל לבנות פרויקטים משלך. המאמר כולל דוגמאות קוד.",
    "Understanding these principles will help you write better, more maintainable code.",
    "We'll discuss common pitfalls and how to avoid them in your projects.",
    "זהו מדריך מקיף שמתאים גם למתחילים וגם למפתחים מתקדמים.",
    "The key takeaway is that proper planning saves time in the long run.",
    "Many developers overlook these aspects, but they are crucial for success.",
    "בסוף המאמר תמצא קישורים למשאבים נוספים ולהמשך הלמידה.",
    "Let's dive in and see how this works in practice.",
] * 6  # Repeat to have enough for long content

CHAT_MESSAGES = [
    "Hi! How can I help you today?",
    "Thanks for the article, very helpful!",
    "תודה על ההסבר המפורט",
    "Can you explain more about this topic?",
    "I'm having an issue with the setup, any tips?",
    "Great blog post!",
    "איך מתחילים עם הפרויקט?",
    "What's the best way to learn Django?",
    "Has anyone tried this in production?",
    "מומלץ מאוד",
    "Looking forward to more content",
    "Is there a video tutorial for this?",
    "האם יש תמיכה בעברית?",
    "Quick question: does this work with Python 3.11?",
    "Awesome, exactly what I needed!",
    "Can you add more examples?",
    "מחפש מידע על אבטחה",
    "Thanks for sharing",
    "What about performance?",
    "יש טיפים למתחילים?",
    "This solved my problem",
    "Great community here",
    "איפה אפשר למצוא תיעוד?",
    "Keep up the good work!",
    "Need help with deployment",
    "Very clear explanation",
    "האם יש גרסאות קודמות?",
    "Works perfectly, thank you!",
    "Any updates on this?",
    "מעולה",
] * 2

COMMENT_CONTENT = [
    "Great article, thanks for sharing!",
    "Very helpful, learned a lot.",
    "תודה על המאמר המעמיק",
    "Could you elaborate on the last point?",
    "I've been looking for this, exactly what I needed.",
    "מעניין מאוד, אשמח לראות עוד",
    "Nice write-up!",
    "Saved for later, thanks.",
    "האם יש דוגמאות נוספות?",
    "Well explained!",
    "This approach worked for me.",
    "כתוב בצורה ברורה",
    "Agree with most points here.",
    "Useful resource.",
    "תודה רבה",
] * 4

FIRST_NAMES = [
    "David", "Sarah", "Michael", "Rachel", "Daniel", "Noa", "Yosef", "Leah",
    "Ethan", "Maya", "Jacob", "Talia", "Aaron", "Hannah", "Joshua", "Rivka",
    "Adam", "Esther", "Ben", "Miriam", "Avi", "Shira", "Gil", "Dana",
    "Tom", "Emma", "John", "Anna", "Alex", "Lily", "Max", "Sophie",
]

LAST_NAMES = [
    "Cohen", "Levy", "Mazor", "Abraham", "Goldstein", "Katz", "Rosen",
    "Shapiro", "Friedman", "Kaplan", "Green", "Weiss", "Berger", "Stone",
]

DOMAINS = ["gmail.com", "outlook.com", "yahoo.com", "example.com", "company.co.il"]


class Command(BaseCommand):
    help = "Seed: 50 users, 50 articles, 50 chat messages, 50 comments, 50 ratings, tags, tracking logs, files"

    def add_arguments(self, parser):
        parser.add_argument("--clear", action="store_true", help="Clear existing data before seeding")
        parser.add_argument("--count", type=int, default=50, help="Count per entity (default 50)")

    def handle(self, *args, **options):
        count = options["count"]
        clear = options["clear"]

        if clear:
            self.stdout.write("Clearing existing data...")
            Comment.objects.all().delete()
            ArticleRating.objects.all().delete()
            Article.objects.all().delete()
            ChatMessage.objects.all().delete()
            UploadedFile.objects.all().delete()
            SystemTrackingLog.objects.all().delete()
            User.objects.filter(is_superuser=False).delete()

        # Ensure groups exist
        admin_grp, _ = Group.objects.get_or_create(name="Admin")
        editors_grp, _ = Group.objects.get_or_create(name="Editors")
        users_grp, _ = Group.objects.get_or_create(name="Users")

        # Create tags
        self.stdout.write("Creating tags...")
        tags = []
        for name in TAGS:
            t, _ = Tag.objects.get_or_create(name=name)
            tags.append(t)

        # Create 50 users
        self.stdout.write(f"Creating {count} users...")
        user_list = []
        existing_usernames = set(User.objects.values_list("username", flat=True))
        for i in range(count):
            first = random.choice(FIRST_NAMES)
            last = random.choice(LAST_NAMES)
            base = f"{first.lower()}{last.lower()}"
            username = base
            j = 0
            while username in existing_usernames:
                username = f"{base}{j}"
                j += 1
            existing_usernames.add(username)
            email = f"{username}@{random.choice(DOMAINS)}"
            u = User.objects.create_user(
                username=username,
                email=email,
                password="password123",
                first_name=first,
                last_name=last,
            )
            users_grp.user_set.add(u)
            if len(user_list) == 0:
                u.is_staff = True
                u.is_superuser = True
                u.save()
                admin_grp.user_set.add(u)
            elif len(user_list) < 5:
                editors_grp.user_set.add(u)
            user_list.append(u)

        # Create 50 articles
        self.stdout.write(f"Creating {count} articles...")
        articles = []
        titles_pool = list(ARTICLE_TITLES)
        random.shuffle(titles_pool)
        for i in range(count):
            author = random.choice(user_list)
            title = titles_pool[i % len(titles_pool)]
            if i >= len(titles_pool):
                title = f"{title} – Part {i // len(titles_pool) + 1}"
            content = " ".join(random.sample(ARTICLE_CONTENT_SNIPPETS, min(8, len(ARTICLE_CONTENT_SNIPPETS))))
            content = content[:2000]
            a = Article.objects.create(
                title=title,
                content=content,
                author_name=f"{author.first_name} {author.last_name}".strip() or author.username,
                author=author,
            )
            num_tags = random.randint(1, 4)
            a.tags.set(random.sample(tags, num_tags))
            articles.append(a)

        # Create 50 chat messages
        self.stdout.write(f"Creating {count} chat messages...")
        for _ in range(count):
            ChatMessage.objects.create(
                user=random.choice(user_list),
                content=random.choice(CHAT_MESSAGES)[:500],
            )

        # Create 50 comments (spread across articles)
        self.stdout.write(f"Creating {count} comments...")
        for _ in range(count):
            article = random.choice(articles)
            user = random.choice(user_list)
            Comment.objects.create(
                article=article,
                user=user,
                content=random.choice(COMMENT_CONTENT),
            )

        # Create 50 article ratings
        self.stdout.write(f"Creating {count} article ratings...")
        rated = set()
        for _ in range(count):
            article = random.choice(articles)
            user = random.choice(user_list)
            key = (article.id, user.id)
            if key not in rated:
                rated.add(key)
                ArticleRating.objects.create(article=article, user=user, score=random.randint(1, 5))

        # Create 50 system tracking logs
        self.stdout.write(f"Creating {count} tracking logs...")
        for i in range(count):
            log_type = random.choice([
                SystemTrackingLog.LOG_TYPE_PASSWORD_RESET,
                SystemTrackingLog.LOG_TYPE_HUMAN_VERIFY,
            ])
            email = f"user{i}@{random.choice(DOMAINS)}" if log_type == SystemTrackingLog.LOG_TYPE_PASSWORD_RESET else None
            SystemTrackingLog.objects.create(
                log_type=log_type,
                email=email,
                ip_address="127.0.0.1" if i % 3 == 0 else None,
                user_agent="Mozilla/5.0 SeedBrowser/1.0" if i % 2 == 0 else "",
            )

        # Create 50 uploaded files (virtual text files)
        self.stdout.write(f"Creating {count} uploaded files...")
        file_names = [
            "document.txt", "notes.md", "readme.txt", "guide.pdf.txt", "tutorial.txt",
            "instructions.txt", "report.txt", "summary.md", "data.csv.txt", "config.txt",
        ]
        for i in range(count):
            uploader = random.choice(user_list) if user_list else None
            fname = f"seed_file_{i}.txt"
            display_name = random.choice(file_names).replace(".txt", f"_{i}.txt")
            content = ContentFile(f"Seed file content #{i}\n\nGenerated for testing.", name=fname)
            uf = UploadedFile.objects.create(
                name=display_name,
                uploaded_by=uploader,
            )
            uf.file.save(fname, content, save=True)

        self.stdout.write(self.style.SUCCESS(
            f"Done! Created: {len(user_list)} users, {len(articles)} articles, "
            f"{count} chat messages, {count} comments, {len(rated)} ratings, "
            f"{len(tags)} tags, {count} tracking logs, {count} files."
        ))
