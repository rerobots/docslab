docslab mdBook preprocessor
===========================

This mdBook preprocessor uses [docslab](https://github.com/rerobots/docslab)
to make code blocks interactive.

To configure your book source to use it,

    mdbook-docslab install path/to/your/book

which will not modify existing values if the book is already using docslab.
In other words, it is safe to run `mdbook-docslab install` more than once.
