# Coding Agent Skill

This skill enables OpenClaw to run coding agents like Codex CLI, Claude Code, OpenCode, or Pi Coding Agent.

## Usage

### Quick one-shot (auto-approves) - remember PTY!
```bash
# PTY required for interactive sessions
bash pty:true workdir:~/project command:"codex exec --full-auto 'Build a dark mode toggle'"
```

### Background for longer work
```bash
# Use background:true for long-running tasks
bash pty:true workdir:~/project background:true command:"codex exec 'Refactor the entire auth system'"
```

### With explicit approval
```bash
# Without --full-auto, requires human approval for each step
bash pty:true workdir:~/project command:"codex exec 'Add user profile page'"
```

## Supported Agents
- **Codex CLI**: OpenAI's coding assistant
- **Claude Code**: Anthropic's coding assistant  
- **OpenCode**: Open-source coding agent
- **Pi Coding Agent**: Inflection's coding assistant

## Security Notes
- Always review code changes before merging
- Use sandboxed environments for untrusted code
- Monitor resource usage for long-running tasks

## Configuration
Set your preferred coding agent in `~/.openclaw/config.yaml`:
```yaml
coding:
  default_agent: "codex"
  auto_approve: false
  timeout_seconds: 3600
```