import csv
import json

input_file = "trade_log.csv"
output_file = "data.js"

with open(input_file, "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    data = [row for row in reader]

for row in data:
    row["result"] = int(row["result"])
    row["pips"] = float(row["pips"])
    row["rr"] = float(row["rr"])

with open(output_file, "w", encoding="utf-8") as f:
    f.write("const tradeLog = ")
    json.dump(data, f, ensure_ascii=False, indent=2)
    f.write(";")
