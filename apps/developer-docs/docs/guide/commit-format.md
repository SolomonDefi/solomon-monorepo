## Commit Message Format

This specification is inspired by [Angular's Commit Message Guidelines](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#-commit-message-format). We have precise rules over how our Git commit messages must be formatted. This format leads to easier to read commit history. It also allows automatically generated, human readable, changelogs.

Each commit message consists of a header, a body, and a footer.

```
<scope> [<project>]: <short-summary> #<issue-number>
```

Any line of the commit message cannot be longer than 100 characters.

## Commit Message Header

```

<scope>[<project>]: <short summary> #<issue-number>
  |       |             |               └─⫸ Reference to corresponding issue
  │       │             │
  │       │             └─⫸ Summary in present tense. Not capitalized. No period at the end.
  │       │
  │       └─⫸ The app or library where the majority of changes occurred
  │
  └─⫸ Commit Scope: Emoji representing the type of work done
```

### Scopes

TODO

### Projects

`root` refers to changes that affect monorepo operation, and arent specifict

- root
- mailer
- evidence
- contracts
- docs

### Summary

Use the summary field to provide a succinct description of the change:

- use the imperative, present tense: "change" not "changed" nor "changes"
- don't capitalize the first letter
- no dot (.) at the end

## Commit Message Body

Just as in the summary, use the imperative, present tense: "fix" not "fixed" nor "fixes".

Explain the motivation for the change in the commit message body. This commit message should explain why you are making the change. You can include a comparison of the previous behavior with the new behavior in order to illustrate the impact of the change. You can also add any minor details that don't fit in the summary.

## Commit Message Footer

The footer can contain information about breaking changes and is also the place to reference GitHub issues/stories and other PRs that this commit closes or is related to.

```
BREAKING CHANGE: <breaking change summary>
<BLANK LINE>
<breaking change description + migration instructions>
<BLANK LINE>
<BLANK LINE>
Closes #<issue number>
```

Breaking Change section should start with the phrase "BREAKING CHANGE: " followed by a summary of the breaking change, a blank line, and a detailed description of the breaking change that also includes migration instructions.

## Revert Commits

If the commit reverts a previous commit, it should begin with revert: , followed by the header of the reverted commit.

The content of the commit message body should contain:

- information about the SHA of the commit being reverted in the following format: `This reverts commit <SHA>`,
- a clear description of the reason for reverting the commit message.

## Examples

```sh
# A PR commit not associated with any issue/story
$ git commit -m ':fix: [docs]: fix typo #1'
```

```sh
# A PR commit with changes limited to a particular scope
$ git commit -m ':fix: [api]: add missing field to user endpoint response #2'
```

```sh
# A PR commit that will close an open issue in the same repo as the issue
$ git commit -m ':wrench: [root]: add commit lint check #7

Closes #7'
```
