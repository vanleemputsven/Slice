# First list

## Why the scan names real charges

The landing questions (how many, which kinds, a spend band) are a way in. They are not a subscription. Inventing a streaming row from "I picked streaming" would put money on the horizon that the person does not pay.

The last step asks for a name, a cycle price, and the next charge date. Blank rows are skipped. A signed-in person saves those rows onto their account. A guest keeps them in `sessionStorage` under `slice-first-list-v1` and Slice inserts them once, after sign-in, only when the account still has no subscriptions. The draft is removed as it is read, so a refresh cannot insert it again.

The spend band stays a sentence on that step. It is not stored and it is not split into prices.
