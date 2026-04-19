name: Bug report
description: Create a report to help us improve AuroraLens
labels: ["bug"]
body:
  - type: markdown
    attributes:
      value: |
        Thanks for taking the time to fill out this bug report!
  - type: textarea
    id: description
    attributes:
      label: Bug Description
      description: A clear and concise description of what the bug is.
    validations:
      required: true
  - type: textarea
    id: reproduction
    attributes:
      label: Steps to Reproduce
      description: How can we reproduce this behavior?
    validations:
      required: true
  - type: textarea
    id: expected
    attributes:
      label: Expected Behavior
      description: What did you expect to happen?
  - type: textarea
    id: screenshots
    attributes:
      label: Screenshots
      description: If applicable, add screenshots to help explain your problem.
  - type: input
    id: environment
    attributes:
      label: Environment
      description: Browser, OS, Python version, etc.
