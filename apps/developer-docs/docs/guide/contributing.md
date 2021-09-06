# Contributing

The Solomon ecosystem consists of several repositories hosted with Git/Github. Depending on the technology, there are different ways a community member can contribute. The Guidelines section below notes some common things to keep in mind, and the Links section lists the contribution guideliness for specific projects.

## General Guidelines

These are general contribution guidelines for all projects, regardless of language or libraries used. See the [Language Specific](#language-specific-guidelines) section for more fine-grained guidelines.

- Consider what you are going to code before jumping straight in. Is there already code that covers what you are going to do? What is the simplest way to code the feature without compromising maintainability?
- Add unit tests if you're implementing or changing a feature.
- Review and update documentation relevant to your changes, including these developer docs, project READMEs, and inline code comments.
- Create and keep up to date [an OpenAPI Specification](https://swagger.io/specification/) file in the form of `openapi.yaml` in the project root all web services/APIs.
- Remove debug statements
- Set up your editor or IDE to automatically lint and format on save. Code that does not pass CI lint/format/test checks will be automatically rejected.

### Pull Requests

Pull requests (PRs) represent a feature branch currently in progress, or ready to merge to `main`
There may be multiple PRs per issue, but each PR should only cover a single issue (with some exceptions).

Follow these steps to ensure a smooth process:

- Link to the corresponding issue in the description (e.g. `#117`)
  - If the PR will close the issue, include e.g. `Close #117` on it's own line
  - If the PR is for a hotfix, mention it in the description
- Verify that status/CI checks are passing
- Squash trivial commits and edit poorly worded messages with [interactive rebase](https://thoughtbot.com/blog/git-interactive-rebase-squash-amend-rewriting-history#interactive-rebase)

### Commits

- Follow the commit message guidelines below
  - Use the present tense ("fix bug", not "fixed bug")
  - Use the [imperative mood](https://en.wikipedia.org/wiki/Imperative_mood) ("update packages", not "updates packages")
- No merge commits, PRs must be rebased on `main` before merging
  - If there are conflicts, this must be done locally. A force push is necessary (`git push --force-with-lease`)
- One task/subtask per commit
- Push often, but avoid pushing broken code

### Dependencies

Dependencies should be discussed before they're added, and evaluated on a few points:

- Is it mature and/or actively developed?
- Is it cross platform?
- Does it pull in many sub-dependencies?
- How does it affect the build size/runtime speed?

## Licenses and Attribution

Non permissively licensed code should be avoided, as well as copy pasting from arbitrary online sources.

If a library is not included in the standard package manager (NPM, PyPI, Cargo, etc) and is non-trivial to reproduce, exceptions can be made, but should be discussed in an issue first.

## Language Specific Guidelines

This section contains detailed guidelines for specific languages and frameworks.

### Solidity

### Typescript

### Vue3

### CSS/PostCSS

#### CSS media queries

Media queries should be placed at the end of the style block/file, within the scope of the top level class.

Good:

```
.top-level-content {
  .stuff {
    width: 50%;
  }
  @media (max-width: $mobile-width) {
    .stuff {
      width: 100%;
    }
}
```

Bad:

```
.top-level-content {
  .stuff {
    width: 50%;
    @media (max-width: $mobile-width) {
      width: 100%;
    }
  }
}
```

We only use max-width media queries, so mobile style is a union of mobile/tablet/desktop, tablet style is a union of tablet/desktop, and desktop is default.

#### CSS vendor prefixes

The PostCSS `autoprefixer` plugin is included, so CSS vendor extensions should never be necessary.

### Python

- Lint: `pylint`
  - Configuration: `.pylintrc`
- Format: [`black`](https://github.com/psf/black)

### Rust

TBD
