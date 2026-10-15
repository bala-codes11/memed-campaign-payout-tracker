const BASE_URL = "http://localhost:5000/api/submissions";

const submissionIds = [
  "6ace3575cf2ebc39fcdbfe34",
  "6ace3581cf2ebc39fcdbfe35",
];

async function updateViews(id) {
  const response = await fetch(`${BASE_URL}/${id}/views`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ views: 1000 }),
  });

  const result = await response.json();

  return {
    status: response.status,
    result,
  };
}

async function main() {
  console.log("Sending both payout requests concurrently...");

  const results = await Promise.all(
    submissionIds.map((id) => updateViews(id))
  );

  console.dir(results, { depth: null });
}

main().catch(console.error);