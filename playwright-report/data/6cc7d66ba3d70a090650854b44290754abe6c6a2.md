# Page snapshot

```yaml
- generic [ref=e2]:
  - region "Notifications (F8)":
    - list
  - region "Notifications alt+T"
  - main "404" [ref=e4]:
    - generic [ref=e5]:
      - heading "404" [level=1] [ref=e6]
      - alert [ref=e7]: Oops! Page not found
      - link "Return to homepage" [ref=e8] [cursor=pointer]:
        - /url: /
        - text: Return to Home
```