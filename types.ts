
export enum Severity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export type Category = 'AUTH' | 'INPUT_VALIDATION' | 'DATA_EXPOSURE' | 'RATE_LIMIT' | 'LOGGING' | 'CONFIG' | 'WEB';
export type Web3Category = 'ACCESS_CONTROL' | 'TOKEN_LOGIC' | 'REENTRANCY_RISK' | 'UPGRADABILITY' | 'ADMIN_KEYS' | 'EVENTS';

export interface Finding {
  category: Category;
  severity: Severity;
  title: string;
  description: string;
  recommendation: string;
  evidence: {
    endpoint: string;
    reason: string;
  };
}

export interface Web3Finding {
  category: Web3Category;
  severity: Severity;
  title: string;
  description: string;
  recommendation: string;
}

export interface GherkinFeature {
  name: string;
  content: string;
}

export interface ApiTestCase {
  title: string;
  steps: string[];
  expected: string;
}

export interface SecurityReport {
  summary: string;
  riskScore: number;
  findings?: Finding[];
  web3Findings?: Web3Finding[];
  quickFixChecklist?: string[];
  safeChecklist?: string[];
  gherkinFeatures?: GherkinFeature[];
  apiTestCases?: ApiTestCase[];
  priorityOrder?: string[];
}

export type ScanType = 'OPENAPI' | 'JAVA_CODE' | 'SMART_CONTRACT' | 'BUG_ANALYSIS';

export const SAMPLES: Record<ScanType, string> = {
  JAVA_CODE: `// Potential SQLi and IDOR
@GetMapping("/user/{id}")
public User getUser(@PathVariable Long id, @RequestParam String name) {
    String query = "SELECT * FROM users WHERE id = " + id + " AND name = '" + name + "'";
    return jdbcTemplate.queryForObject(query, User.class);
}`,
  OPENAPI: `openapi: 3.0.0
info:
  title: Employee Payroll API
paths:
  /api/v1/salaries/{id}:
    get:
      summary: Get salary details
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string`,
  SMART_CONTRACT: `// Vulnerable to Reentrancy
contract Vault {
    mapping(address => uint) public balances;
    function withdraw() public {
        uint bal = balances[msg.sender];
        (bool sent, ) = msg.sender.call{value: bal}("");
        require(sent);
        balances[msg.sender] = 0;
    }
}`,
  BUG_ANALYSIS: `Bug: Path Traversal in file upload.
Expected: Only allow .jpg and .png in /uploads/ directory.
Snippet:
public void saveFile(String path) {
    File file = new File("/var/www/data/" + path);
    // ... write file
}`
};
