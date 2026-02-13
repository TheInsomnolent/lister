# Auto-Merge Setup for Copilot PRs

This repository is configured to automatically approve and merge Pull Requests created by GitHub Copilot once they are ready (i.e., no longer marked as [WIP]).

## How It Works

The `.github/workflows/auto-merge-copilot.yml` workflow:

1. **Triggers** on PR events: opened, edited, synchronize, ready_for_review
2. **Checks** if the PR is from Copilot by verifying:
   - PR author is `copilot` or `github-actions[bot]`
   - OR the branch name contains `copilot/`
3. **Checks** that the PR title does NOT start with `[WIP]`
4. **Approves** the PR automatically
5. **Enables auto-merge** with squash merge strategy

## Required Repository Settings

To enable this automation, you need to configure the following settings in your GitHub repository:

### 1. Enable Auto-Merge
- Go to **Settings** → **General** → **Pull Requests**
- Check ✅ **Allow auto-merge**

### 2. Branch Protection Rules (Recommended)
- Go to **Settings** → **Branches** → **Branch protection rules**
- Add rule for `main` branch:
  - ✅ **Require a pull request before merging**
  - ✅ **Require approvals** (set to 1)
  - Optional: **Require status checks to pass before merging** (if you have CI/CD checks)
  - Optional: **Require branches to be up to date before merging**

### 3. Workflow Permissions
- Go to **Settings** → **Actions** → **General** → **Workflow permissions**
- Select ✅ **Read and write permissions**
- Check ✅ **Allow GitHub Actions to create and approve pull requests**

### 4. Configure Merge Strategy (Optional)
- Go to **Settings** → **General** → **Pull Requests**
- Configure allowed merge types (the workflow uses **squash merge** by default)
- You can keep all options enabled or only enable squash merge

## Testing the Setup

1. Have GitHub Copilot create a PR with `[WIP]` in the title
2. Verify that the workflow does NOT auto-merge
3. Remove `[WIP]` from the PR title
4. Verify that the workflow automatically approves and merges the PR

## Workflow Details

### Trigger Events
- `opened`: When a new PR is created
- `edited`: When the PR title or description is edited
- `synchronize`: When new commits are pushed to the PR
- `ready_for_review`: When a draft PR is marked as ready

### Permissions Required
- `contents: write` - To merge the PR
- `pull-requests: write` - To approve and enable auto-merge

### Merge Strategy
The workflow uses `--squash` merge by default, which combines all commits into a single commit on the main branch. You can modify this in the workflow file:
- `--squash` - Squash and merge
- `--merge` - Create a merge commit
- `--rebase` - Rebase and merge

## Customization

You can customize the workflow by editing `.github/workflows/auto-merge-copilot.yml`:

- **Change merge strategy**: Modify the `gh pr merge` command flags
- **Add conditions**: Add more checks in the `if` condition
- **Add notifications**: Add steps to notify on success/failure
- **Add delays**: Add a delay step before merging to allow for final checks

## Security Considerations

- The workflow only triggers for PRs from Copilot or branches containing `copilot/`
- The workflow will not run for PRs marked as `[WIP]`
- Branch protection rules still apply (status checks, approvals if configured)
- You can always manually review and close PRs if needed before they merge
