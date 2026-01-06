
import { GoogleGenAI, Type } from "@google/genai";
import { SecurityReport, ScanType } from "../types.ts";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const getReportSchema = (type: ScanType) => {
  if (type === 'SMART_CONTRACT') {
    return {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING },
        riskScore: { type: Type.NUMBER },
        web3Findings: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              severity: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              recommendation: { type: Type.STRING }
            },
            required: ['category', 'severity', 'title', 'description', 'recommendation']
          }
        },
        safeChecklist: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
      required: ['summary', 'riskScore', 'web3Findings', 'safeChecklist']
    };
  }

  return {
    type: Type.OBJECT,
    properties: {
      summary: { type: Type.STRING },
      riskScore: { type: Type.NUMBER },
      findings: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            severity: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            recommendation: { type: Type.STRING },
            evidence: {
              type: Type.OBJECT,
              properties: {
                endpoint: { type: Type.STRING },
                reason: { type: Type.STRING }
              },
              required: ['endpoint', 'reason']
            }
          },
          required: ['category', 'severity', 'title', 'description', 'recommendation', 'evidence']
        }
      },
      quickFixChecklist: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
      gherkinFeatures: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            content: { type: Type.STRING }
          },
          required: ['name', 'content']
        }
      },
      apiTestCases: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            steps: { type: Type.ARRAY, items: { type: Type.STRING } },
            expected: { type: Type.STRING }
          },
          required: ['title', 'steps', 'expected']
        }
      }
    },
    required: ['summary', 'riskScore', 'findings', 'quickFixChecklist']
  };
};

export const runSecurityScan = async (content: string, type: ScanType, mode: 'AUDIT' | 'FORGE'): Promise<SecurityReport> => {
  const model = "gemini-3-pro-preview";
  
  let systemInstruction = "";
  let prompt = "";

  if (type === 'SMART_CONTRACT') {
    systemInstruction = "Act as a Senior Smart Contract Auditor. Perform a deep defensive security review of Solidity code. Focus on fund safety and state atomicity. No exploit payloads.";
    prompt = `
      Perform a Web3 Guard defensive review.
      
      ### TARGET SOURCE CODE
      ${content}

      ### INSTRUCTIONS
      1. Identify vulnerabilities like Reentrancy, Access Control flaws, and Logic Errors.
      2. Calculate Risk Score (0-100).
      3. Provide remediation steps based on the Checks-Effects-Interactions pattern.
      
      Return strict JSON matching the schema.
    `;
  } else {
    systemInstruction = mode === 'AUDIT' 
      ? "Act as a Senior Security Architect. Perform a deep defensive audit focusing on OWASP. No exploits."
      : "Act as a Lead Security QA Engineer. Synthesize defensive Gherkin features and API negative test cases. No exploits.";

    prompt = `
      Mode: ${mode}
      Target Type: ${type}
      
      ### TARGET CONTENT
      ${content}

      ### INSTRUCTIONS
      1. Identify logic flaws and vulnerabilities.
      2. Calculate Risk Score.
      ${mode === 'FORGE' ? `
      3. FORGE MODE ACTIVE: Generate Gherkin Features and API Negative Test Cases.
      ` : '3. Provide findings and recommendations.'}
      
      Return strict JSON matching the schema.
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: getReportSchema(type),
        thinkingConfig: { thinkingBudget: 15000 }
      },
    });

    const text = response.text || '{}';
    return JSON.parse(text) as SecurityReport;
  } catch (error) {
    console.error("Sentinel Intelligence Error:", error);
    throw new Error("Neural link unstable. Verification failed.");
  }
};