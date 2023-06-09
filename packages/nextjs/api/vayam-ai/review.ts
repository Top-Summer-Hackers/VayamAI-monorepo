import api from ".";

export function submitReview(data: {
  review: {
    id: string;
    freelancer_id: string;
    review: string;
    star: number;
  };
}) {
  return api.post("/review", data.review).then(response => response.data);
}
