# Git Essentials Skill

Essential Git commands and workflows for version control.

## Commands

### Basic Git Operations
```bash
# Check status
git status

# Add files
git add .

# Commit changes
git commit -m "message"

# Push to remote
git push origin main

# Pull latest changes
git pull origin main
```

### Branch Management
```bash
# Create and switch to new branch
git checkout -b feature-name

# Switch branches
git checkout branch-name

# Merge branches
git merge feature-branch

# Delete branch
git branch -d feature-branch
```

### Advanced Operations
```bash
# View commit history
git log --oneline

# Reset to previous commit
git reset --hard HEAD~1

# Stash changes
git stash
git stash pop
```

## Best Practices

- Always pull before pushing
- Write descriptive commit messages
- Use feature branches for new work
- Regularly sync with main branch