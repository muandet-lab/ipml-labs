# Possibility Theory Lab

A static, offline-capable teaching app on three mutually exclusive states.
Open index.html directly in a browser, or serve the repository locally.
There are no packages, CDN dependencies, login requirements, or build steps.

Topics: normalized possibility distributions; event possibility and necessity;
maxitivity and minitivity; ignorance vs uniform probability; nested alpha-cuts;
consonant belief functions; credal sets and tight event probability bounds.

The app fixes one user-selected grade at 1. Switching this anchor sets the new
grade to 1; the old one remains editable. This keeps the model normalized.
Candidate probability sliders keep the vector on the simplex.

Numerical convention:
Pi(E) = max_{i in E} pi_i, Pi(empty)=0; N(E)=1-Pi(complement(E)).
M(pi) = {p >= 0, sum p = 1, P(E) <= Pi(E) for every event E}.
The code enumerates all polytope vertices using pairs of active constraints
and the probability normalization equality. All eight events are checked.
Calculations use a numerical feasibility tolerance of 1e-9; display uses 2 decimals.
The candidate may change its other probability coordinate when needed to stay
on the simplex. In general the event lower and upper bounds are attained at
different distributions. Singleton constraints alone do not define M(pi).

Run mathematical verification:
    node possibility-theory/tests/model.test.cjs
from the repository root (Node is needed only for this optional test).
The test covers ties, zero grades, all event bounds, focal-set masses,
max/min laws, and credal sets that reduce to segments or points.

The numeric interpretation of grades as upper probabilities is distinct from
purely ordinal possibility. This distinction and the limitations of consonant
models are discussed in the interface. References are linked in the footer.
