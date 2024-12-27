import React, { useState, useEffect } from "react";
import axiosInstance from "../../../../utils/axiosInstance";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";

export function PlayerSelectDialog({
  open,
  onClose,
  onSelect,
  players = [],
  title = "Select Player",
  description = "Choose the player for this eventaaaaaa",
}) {
  const [playersList, setPlayersList] = useState([]);
  const [error, setError] = useState(null); // State for error handling

  // Fetch players from API
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await axiosInstance.get("/national-team-player-staff");
        setPlayersList(response.data);
        console.log('the following are playerlist: ', playersList)
      } catch (err) {
        setError("Failed to fetch national team players. Please try again later.");
        console.error(err);
      }
    };

    fetchPlayers();
  }, []);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Select onValueChange={onSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Select player" />
          </SelectTrigger>
          <SelectContent>
            {players.map(player => (
              <SelectItem key={player.id} value={player.playerStaff.lastName}>
                #{player.playerStaff.id} - {player.playerStaff.lastName} ({player.playerStaff.
                    positionInClub
                    })
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </DialogContent>
    </Dialog>
  );
} 