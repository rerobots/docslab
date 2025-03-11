Introduction
============

The aim of this project is to support learning and development by making
documentation about robots and electronics interactive.
Run examples on real hardware in a safe and reproducible way.

Getting started
---------------

**docslab** is essentially a TypeScript package that makes HTML ``code`` blocks
interactive. The kind of interactivity provided depends on the target hardware,
but in all cases, hardware is provisioned by hardshare_.
This page describes how to use docslab directly in HTML or in JavaScript.
To learn how to use docslab with a documentation generator like Sphinx or
Docusaurus, read the section about :doc:`integrations`.

.. highlight:: html

::

    <div class="docslab" data-readonly data-hardshareo="examples" data-hardshareid="null" data-path="hola.c" data-command="gcc -o hola hola.c && ./hola">
        <a href="https://github.com/rerobots/docslab/tree/main/examples" target="_blank">Try it</a>
        <pre><code>
    #include &lt;stdio.h&gt;
    int main()
    {
        printf("Hola, mundo!\n");
        return 0;
    }
        </code></pre>
    </div>

Complete examples written in HTML are shown at `<examples/html>`_


.. _hardshare: https://github.com/rerobots/hardshare
