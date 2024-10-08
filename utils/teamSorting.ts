import { Match2Player, Team } from "../schemas/teamSchema";

const teamArrToTeamObj = (teams: Array<Team>) => {
  let teamsObj: any = {};
  teams.forEach((team) => {
    teamsObj[team.team_name] = {
      rank: -1,
      ...team,
      num_wins: 0,
      num_losses: 0,
      num_draws: 0,
      total_goals: 0,
    };
  });

  return teamsObj;
};

const teamObjToTeamArray = (teams: any) => {
  return Object.values(teams);
};

export const updateTeamsBasedOnMatches = (
  teams: Array<Team>,
  matches: Array<Match2Player>
) => {
  // Convert array to an object for more efficient algorithm
  let teamsObj = teamArrToTeamObj(teams);
  let teamsObjTmp = { ...teamsObj };

  // Go through each match and update the teams status accordingly
  matches.forEach(({ team1_name, team2_name, team1_goals, team2_goals }) => {
    // Update match data
    teamsObjTmp[team1_name].match_history = [
      ...(teamsObjTmp[team1_name].match_history || []),
      {
        opponent_name: team2_name,
        goals_scored: team1_goals,
        goals_opponent_scored: team2_goals,
      },
    ];
    teamsObjTmp[team2_name].match_history = [
      ...(teamsObjTmp[team2_name].match_history || []),
      {
        opponent_name: team1_name,
        goals_scored: team2_goals,
        goals_opponent_scored: team1_goals,
      },
    ];

    // Update total goals
    teamsObjTmp[team1_name].total_goals += team1_goals;
    teamsObjTmp[team2_name].total_goals += team2_goals;

    // Update win loss draw count
    if (team1_goals > team2_goals) {
      teamsObjTmp[team1_name].num_wins += 1;
      teamsObjTmp[team2_name].num_losses += 1;
    } else if (team1_goals < team2_goals) {
      teamsObjTmp[team1_name].num_losses += 1;
      teamsObjTmp[team2_name].num_wins += 1;
    } else {
      teamsObjTmp[team1_name].num_draws += 1;
      teamsObjTmp[team2_name].num_draws += 1;
    }
  });

  // Convert object back to array
  return teamObjToTeamArray(teamsObjTmp);
};

export const sortTeams = (teamsArr: Array<Team>) => {
  let sortedTeamsArr = [...teamsArr];

  // If already processed matches
  if (teamsArr[0] && (teamsArr[0].num_wins === 0 || teamsArr[0].num_wins)) {
    sortedTeamsArr.sort((teamA, teamB) => {
      // 1st test
      if (
        (teamA?.num_wins === 0 || teamA?.num_wins) &&
        (teamA?.num_draws === 0 || teamA?.num_draws) &&
        (teamB?.num_draws === 0 || teamB.num_draws) &&
        (teamB?.num_wins === 0 || teamB.num_wins)
      ) {
        let teamAPoints = teamA.num_wins * 3 + teamA.num_draws;
        let teamBPoints = teamB.num_wins * 3 + teamB.num_draws;

        if (teamAPoints !== teamBPoints) {
          console.log(teamBPoints, teamAPoints);
          return teamBPoints - teamAPoints;
        }
      }

      // 2nd test
      if (
        (teamA?.total_goals || teamA?.total_goals === 0) &&
        (teamB?.total_goals || teamB?.total_goals === 0)
      ) {
        if (teamA?.total_goals - teamB?.total_goals != 0) {
          return teamB?.total_goals - teamA?.total_goals;
        }
      }

      // 3rd test
      if (
        (teamA?.num_wins === 0 || teamA?.num_wins) &&
        (teamA?.num_draws === 0 || teamA?.num_draws) &&
        (teamA?.num_losses === 0 || teamA?.num_losses) &&
        (teamB?.num_wins === 0 || teamB.num_wins) &&
        (teamB?.num_draws === 0 || teamB.num_draws) &&
        (teamB?.num_losses === 0 || teamB?.num_losses)
      ) {
        let teamAPoints =
          teamA?.num_wins * 5 + teamA?.num_draws * 3 - teamA?.num_losses;
        let teamBPoints =
          teamB?.num_wins * 5 + teamB?.num_draws * 3 - teamB?.num_losses;

        if (teamAPoints !== teamBPoints) {
          return teamBPoints - teamAPoints;
        }
      }

      // 4th test
      return teamA.date_registered - teamB.date_registered;
    });

    return sortedTeamsArr.map((team, i) => ({
      ...team,
      rank: i + 1,
    }));
  } else {
    return teamsArr;
  }
};
