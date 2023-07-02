import api from ".";

export function submitReview(data: {
  review: {
    deal_id: string;
    freelancer_id: string;
    client_id: string;
    review: string;
    stars: number;
  };
}) {
  return api.post("/review", data.review).then(response => response.data);
}
