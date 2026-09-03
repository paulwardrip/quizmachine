# Introduction
####auto-lightbox
Version 1.x provided a lightbox that would auto-show/hide as you show/hide the element it's attached to.
####auto-modal
Version 2.0 includes lightweight modal support.
 

## Modals




An automatic lightbox that will show and hide when its parent element does, Now has a jQuery plugin (but does not require jQuery, can be used standalone).
It will try to guess at proper z-indexes for itself and multiple parent elements, but if it gets out of whack set explicit z-indexes on all your parent elements that it will be attached to.

# The jQuery way:

```
$(".mymodal").autolightbox();
```

If you want another child window to take ownership of the lightbox:

```
$(".childofmymodal").autolightbox();
```

Just make sure to pass ownership back to mymodal when childofmymodal is closed.

# The standalone way:

```
\\ you can pass in a dom element:
var lightbox = Autolightbox(myelement);

\\ give control to another element, you can also use a query selector:
lightbox.parent(".somethingelse");
```
