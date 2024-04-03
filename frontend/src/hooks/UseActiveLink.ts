import { useMatch } from "react-router-dom";

export function useActiveLink(url: string) {
    return useMatch(url) !== null ? "bg-primary-light" : "";
}
