# Asset inbox
Drop real photos, clips and graphics for social posts into `inbox/<product-slug>/` (this folder is gitignored: media never enters the public repo). Do not put people's names or contact details in file names.
`node scripts/social-assets.mjs scan` registers new files in `ledger.jsonl` (id, product, kind, relative path, date; committed). `next` lists unused ones, `use` marks one used in a post, `status` warns when fewer than 3 unused remain for a product, then the agent asks Yotam for more instead of reusing old ones.
