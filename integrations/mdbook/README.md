docslab mdBook preprocessor
===========================

This [mdBook](https://rust-lang.github.io/mdBook/) preprocessor uses
[docslab](https://github.com/rerobots/docslab)
to make code blocks interactive.

First, install the [mdbook-docslab](https://crates.io/crates/mdbook-docslab)
crate:

    cargo install mdbook-docslab

Then, configure your book source to use it,

    mdbook-docslab install path/to/your/book

which will not modify existing values if the book is already using docslab.
In other words, it is safe to run `mdbook-docslab install` more than once.
