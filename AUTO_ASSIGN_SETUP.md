# Auto-assign Issues Setup

This repository is configured to automatically assign new issues to @copilot when they are created.

## How It Works

The `.github/workflows/auto-assign-issues.yml` workflow:

1. **Triggers** when a new issue is opened
2. **Assigns** the issue to the `copilot` user automatically using GitHub CLI
3. **Requires** minimal permissions (only `issues: write`)

## Required Repository Settings

To enable this automation, you need to configure the following settings in your GitHub repository:

### 1. Workflow Permissions

- Go to **Settings** → **Actions** → **General** → **Workflow permissions**
- Select ✅ **Read and write permissions**
- This allows the workflow to modify issues

### 2. Collaborator Access (Important!)

The `copilot` user must have access to the repository to be assigned to issues:
- Go to **Settings** → **Collaborators and teams**
- Add `copilot` as a collaborator (or ensure they already have access through organization membership)
- Minimum required permission: **Triage** (allows being assigned to issues)

**Note**: If the `copilot` user doesn't have access to the repository, the workflow will fail with an error like "Could not add assignees to issue". Make sure to add `copilot` as a collaborator first.

## Testing the Setup

1. Create a new issue in the repository
2. The workflow will run automatically (check the **Actions** tab)
3. Within a few seconds, you should see `copilot` assigned to the issue
4. If the workflow fails, check that:
   - Workflow permissions are correctly configured
   - The `copilot` user has access to the repository

## Workflow Details

### Trigger Event
- `opened`: When a new issue is created

### Permissions Required
- `issues: write` - To assign users to issues

### GitHub CLI Command
The workflow uses `gh issue edit --add-assignee copilot` to assign the issue. This is a safe, native GitHub operation that:
- Only modifies the assignee list
- Doesn't change issue content, labels, or other metadata
- Can be easily reversed manually if needed

## Customization

You can customize the workflow by editing `.github/workflows/auto-assign-issues.yml`:

- **Change assignee**: Replace `copilot` with a different username
- **Add multiple assignees**: Use `--add-assignee user1,user2,user3`
- **Add conditions**: Add an `if` condition to filter which issues get assigned (e.g., based on labels or title patterns)
- **Add labels**: Add another step to automatically label issues
- **Add notifications**: Add steps to notify the assignee

Example of assigning multiple users:
```yaml
- name: Assign issue to team
  run: |
    gh issue edit "${{ github.event.issue.number }}" \
      --add-assignee copilot,user2,user3
```

Example of conditional assignment based on label:
```yaml
if: contains(github.event.issue.labels.*.name, 'auto-assign')
```

## Security Considerations

- The workflow only triggers on issue creation (not edits or comments)
- It uses the built-in `GITHUB_TOKEN` which is automatically provided by GitHub Actions
- The token has limited scope and only allows operations within the repository
- The workflow only modifies issue assignments, not issue content
- You can always manually remove or change assignees if needed
- The workflow uses GitHub CLI instead of third-party actions for better security

## Troubleshooting

### Workflow fails with "Could not add assignees to issue"
- Make sure the `copilot` user has access to the repository (Settings → Collaborators)
- Minimum required permission level: **Triage**

### Workflow doesn't trigger
- Check that workflow permissions are enabled (Settings → Actions → General)
- Verify that Actions are enabled for the repository

### Multiple workflows triggering
- The issue workflow is independent of PR workflows
- Both can run simultaneously without conflicts
