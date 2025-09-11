### Understanding the Hierarchical Structure in `XXXX.SSS.EVT.TXT`

The hierarchical structure of events in the `EVT.TXT` file is determined by the **`hierarchie`** column. The rules for building the hierarchy are:

- An event with `hierarchie` value **1** is a top-level (root) menu item.
- An event with `hierarchie` value **N** (where N \> 1) is a child of the most recent preceding event with `hierarchie` value **N-1**.

#### Example Walkthrough of 2020.002.EVT.TXT content according to the hierarchy in website

1. The main menu displays "**Débat sur la politique générale sur l'état de la nation**", corresponding to the event at `rang` 7 with `hierarchie` = 1.
2. Selecting this reveals "**Débat**" (event at `rang` 8, `hierarchie` = 2), which is a child of the event at `rang` 7.
3. Selecting "Débat" reveals "**Discours du groupe politique CSV**" (event at `rang` 9, `hierarchie` = 3), a child of the event at `rang` 8.
4. Selecting "Discours..." reveals "**Dépôt de la motion 1**", "**Interruption**", etc. (events starting at `rang` 10, all with `hierarchie` = 4), which are children of the event at `rang` 9.

This confirms that the parent-child relationship is established by sequential `hierarchie` levels in the file.
