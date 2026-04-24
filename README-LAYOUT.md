# Layout & Header System – Usage & Configuration

> _Last updated: 2026-04-24_

A modern, flexible layout and header system for Angular apps, designed for maximum configurability and responsive UX. This guide explains how to use and configure the layout and header components in your application.

---

## 🧭 Quick Start

1. **Use the Layout Component as Your Main Page Wrapper**

- All pages should be wrapped with `AppLayoutComponent` for consistent structure and navigation.
- **Sidenav is displayed by default**—no configuration is needed to show the side navigation. Simply using the layout component will render the sidenav unless you explicitly hide it.

2. **Configure Layout Dynamically**

- Use `LayoutService` to control the visibility of the sidenav (optional), header content, and navigation links.

```typescript
// In your page/component constructor or ngOnInit
this.layoutService.configureLayout(this.destroyRef, {
  showSidenav: false,
  navLinks: [...],   // Array of navigation links for header and mobile menu
  // ...other options
});
```

---

## ✨ Features

- **Configurable Sidenav**: Show or hide the side navigation per page.
- **Header Customization**: Set the title, breadcrumbs, and navigation links.
- **Responsive Navigation**: If `navLinks` are provided, a menu appears in the header and a burger menu is shown on mobile, opening a mobile-friendly drawer.
- **Dynamic Toolbar Actions**: Add custom actions to the header via the `ToolbarActionsService`.

---

## 🛠️ Usage Examples

### Basic Layout

```typescript
this.layoutService.configureLayout(this.destroyRef, {
  showSidenav: true,
});
```

### Adding Navigation Links

```typescript
this.layoutService.configureLayout(this.destroyRef, {
  navLinks: [
    { label: 'Home', target: 'home', icon: 'home' },
    { label: 'About', target: 'about', icon: 'info' },
  ],
});
```

### Responsive Mobile Menu

- When `navLinks` are present, a burger menu appears on mobile.
- Tapping the burger icon opens a mobile navigation drawer with all links.

---

## 🧩 API Reference

### LayoutService

- `configureLayout(destroyRef, options)` – Configure layout options dynamically.
- `setLogoData(data)` – Set logo image, alt text, and link.

### AppLayoutComponent Inputs

- `showSidenav` (boolean)
- `navLinks` (array)
- `title`, `breadcrumbItems`, `logoData`, etc.

---

## 💡 Best Practices

- Always use the layout component as the root wrapper for pages.
- Configure layout as needed for maximum flexibility.
- Use `navLinks` for both desktop and mobile navigation.
- Add toolbar actions via `ToolbarActionsService` for a consistent UX.
