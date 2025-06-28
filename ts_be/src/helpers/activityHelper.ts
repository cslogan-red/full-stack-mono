// The basic supported malicious activity types, these can be extended for more complex scenarios
// The types are written to the application log file with easily queryable prefixes
export enum MaliciousActivityType {
  SQL_INJECTION = "~~~SQL_INJECTION_ATTEMPT:",
  UA_MANIP = "~~~USER_AGENT_MANIPULATION_ATTEMPT:",
  B_F = "~~~BRUTE_FORCE_ATTEMPT:",
  REQ_BODY_SIZE = "~~~REQUEST_BODY_SIZE_EXCEEDED:",
}

export const ENABLED_ACTIVITY_TYPES = {
  SQL_INJECTION: true,
  UA_MANIP: true,
  B_F: true,
  REQ_BODY_SIZE: true,
};
