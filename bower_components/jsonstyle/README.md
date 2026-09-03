# JsonStyle

The JsonStyle library allows you to declare embedded CSS for your Javascript library as an object.
When your library is loaded the generated CSS will be loaded into a style tag under the `<head>` of the html document.

```javascript
JsonStyle.append({
    ".yourclass": {
        "font-family":  "Roboto, sans-serif",
        "position":     "absolute",
        "top":          0
    }
});
```



### Google Fonts

Embedding Google Fonts is also supported:

```javascript
// Include default font weight only:
JsonStyle.googlefont("Roboto");

// Select specific weights:
JsonStyle.googlefont("Montserrat", [200,400]);

// Specific weights and italics:
JsonStyle.googlefont("Montserrat", [200,300,400,700], true);

// Select specific italics:
JsonStyle.googlefont("Montserrat", [200, "300i", 400]);
```