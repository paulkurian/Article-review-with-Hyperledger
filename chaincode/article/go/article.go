/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/*
 * The sample smart contract for documentation topic:
 * Writing Your First Blockchain Application
 */

package main

/* Imports
 * 4 utility libraries for formatting, handling bytes, reading and writing JSON, and string manipulation
 * 2 specific Hyperledger Fabric specific libraries for Smart Contracts
 */
import (
	"bytes"
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

var lengthOfLedger int = 0;


var voterRecord []string

// Define the Smart Contract structure
type SmartContract struct {
}

// Define the car structure, with 4 properties.  Structure tags are used by encoding/json library
type Article struct {
	Publisher  string `json:"publisher"`
	Score  int `json:"score"`
	
}


func contains(array []string, element string) bool {
    for _, a := range array {
        if a == element {
            return true
        }
    }
    return false
}
/*
 * The Init method is called when the Smart Contract "fabcar" is instantiated by the blockchain network
 * Best practice is to have any Ledger initialization in separate function -- see initLedger()
 */
func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}

/*
 * The Invoke method is called as a result of an application request to run the Smart Contract "fabcar"
 * The calling application program has also specified the particular smart contract function to be called, with arguments
 */
func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {

	// Retrieve the requested Smart Contract function and arguments
	function, args := APIstub.GetFunctionAndParameters()
	// Route to the appropriate handler function to interact with the ledger appropriately
	if function == "initLedger" {
		return s.initLedger(APIstub)
	} else if function == "voteGood" {
		return s.voteGood(APIstub, args)
	} else if function == "voteBad" {
		return s.voteBad(APIstub, args)
	} else if function == "queryAllScores" {
		return s.queryAllScores(APIstub)
	} else if function == "queryArticleScore" {
		return s.queryArticleScore(APIstub, args)
	} else if function == "addArticle" {
		return s.addArticle(APIstub, args)
	} 

	return shim.Error("Invalid Smart Contract function name.")
}



func (s *SmartContract) queryArticleScore(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	articleAsBytes, _ := APIstub.GetState(args[0])
	return shim.Success(articleAsBytes)
}




func (s *SmartContract) initLedger(APIstub shim.ChaincodeStubInterface) sc.Response {
	articles := []Article{
		Article{Publisher: "Edict", Score: 0 },

	}

	i := 0
	for i < len(articles) {
		fmt.Println("i is ", i)
		articleAsBytes, _ := json.Marshal(articles[i])
		APIstub.PutState("ART"+strconv.Itoa(i), articleAsBytes)
		fmt.Println("Added", articles[i])
		i = i + 1

	}

	lengthOfLedger = len(articles)


	return shim.Success(nil)
}
func (s *SmartContract) addArticle(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	

	var article = Article{Publisher: args[0], Score: 0}

	articleAsBytes, _ := json.Marshal(article)
	APIstub.PutState("ART"+strconv.Itoa(lengthOfLedger), articleAsBytes)
	lengthOfLedger = lengthOfLedger + 1
	return shim.Success(nil)
}




func (s *SmartContract) queryAllScores(APIstub shim.ChaincodeStubInterface) sc.Response {

	startKey := "ART0"
	endKey := "ART999"

	resultsIterator, err := APIstub.GetStateByRange(startKey, endKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing QueryResults
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Record\":")
		// Record is a JSON object, so we write as-is
		buffer.WriteString(string(queryResponse.Value))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- queryAllScores:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}



func (s *SmartContract) voteGood(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	
	if contains(voterRecord, args[0]+" "+args[1]) == false {
		articleAsBytes, _ := APIstub.GetState(args[0])
		article := Article{}
		json.Unmarshal(articleAsBytes, &article)
		article.Score = article.Score + 1

		voterRecord = append(voterRecord, args[0]+" "+args[1])
		
		articleAsBytes, _ = json.Marshal(article)
		APIstub.PutState(args[0], articleAsBytes)
	} else {
		return shim.Error("User: "+args[1]+" has already voted")
	}
	

	return shim.Success(nil)
}
func (s *SmartContract) voteBad(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	
	if contains(voterRecord, args[0]+" "+args[1]) == false {
		articleAsBytes, _ := APIstub.GetState(args[0])
		article := Article{}
		json.Unmarshal(articleAsBytes, &article)
		article.Score = article.Score - 1
		voterRecord = append(voterRecord, args[0]+" "+args[1])
		articleAsBytes, _ = json.Marshal(article)
		APIstub.PutState(args[0], articleAsBytes)
	} else {
		fmt.Println("User: "+args[1]+" has already voted")
	}

	

	return shim.Success(nil)
}


// The main function is only relevant in unit test mode. Only included here for completeness.
func main() {

	// Create a new Smart Contract
	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}
