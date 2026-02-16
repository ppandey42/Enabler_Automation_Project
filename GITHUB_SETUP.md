# GitHub Push Commands
# Replace YOUR_GITHUB_URL with the actual URL from your new GitHub repository

# Add the remote origin
git remote add origin YOUR_GITHUB_URL

# Push to GitHub
git branch -M main
git push -u origin main

# Alternative SSH method (if you have SSH keys set up):
# git remote add origin git@github.com:yourusername/automation-project-suite.git
# git push -u origin main

# To verify the remote was added correctly:
# git remote -v

# Future pushes after initial setup:
# git add .
# git commit -m "Your commit message"
# git push