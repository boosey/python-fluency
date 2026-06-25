# Idiomatic Python Resources

Curated, high-trust sources. Knowledge in lessons is drawn from here, not from
guesses. Annotate every entry: what it covers, when to reach for it.

## Knowledge

- [The Python Tutorial (official docs)](https://docs.python.org/3/tutorial/index.html)
  The canonical introduction. Use for: authoritative behaviour of language features.
- [The Python Language Reference — Data model](https://docs.python.org/3/reference/datamodel.html)
  How objects, dunder methods, and the iteration/sequence protocols actually work.
  Use for: anything about `__len__`, `__iter__`, `__getitem__`, truthiness, `with`.
- [PEP 8 — Style Guide for Python Code](https://peps.python.org/pep-0008/)
  The community style standard. Use for: naming, layout, "is this idiomatic?" calls.
- [PEP 20 — The Zen of Python](https://peps.python.org/pep-0020/)
  The aesthetic philosophy behind "Pythonic". Use for: *why* an idiom is preferred.
- [Real Python](https://realpython.com/)
  High-quality tutorials with worked examples. Use for: deep-dives on a single idiom.
- ["Transforming Code into Beautiful, Idiomatic Python" — Raymond Hettinger (PyCon 2013)](https://www.youtube.com/watch?v=OSGv2VnC0go)
  Core-developer walkthrough of replacing non-Pythonic patterns with idiomatic ones.
  Use for: the single best "what makes it Pythonic" overview. **Primary source.**
- [_Fluent Python_, 2nd ed. — Luciano Ramalho (O'Reilly)](https://www.oreilly.com/library/view/fluent-python-2nd/9781492056348/)
  The definitive book on writing idiomatic Python via the data model. Use for: depth
  on comprehensions, generators, dunder methods, decorators. (Paid — note for budget.)

## Wisdom (Communities)

- [r/learnpython](https://www.reddit.com/r/learnpython/)
  Beginner-friendly, well moderated. Use for: "is this idiomatic?" and code critique.
- [Python Discord](https://www.pythondiscord.com/)
  Large, actively moderated. Use for: real-time questions and code review.

## Gaps
- _(resolved)_ Pattern matching (`match`/`case`, 3.10+) is now grounded in the
  official tutorial and [PEP 636](https://peps.python.org/pep-0636/), cited in
  lesson 16.
