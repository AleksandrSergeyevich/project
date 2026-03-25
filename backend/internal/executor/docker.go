package executor

import (
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"time"
)

func RunWebContainer(jobID, volumePath string) (string, error) {
	containerName := fmt.Sprintf("web-%s", jobID)

	_ = exec.Command("docker", "rm", "-f", containerName).Run()

	hostTmpBase := os.Getenv("HOST_TMP_PATH")
	if hostTmpBase == "" {
		wd, err := os.Getwd()
		if err == nil {
			hostTmpBase = filepath.Join(wd, "tmp")
		} else {
			hostTmpBase = "/root/tmp"
		}
	}

	baseName := filepath.Base(volumePath)
	hostVolumePath := filepath.Join(hostTmpBase, baseName)

	log.Printf("🌐 Web container volume: %s → /usr/share/nginx/html", hostVolumePath)

	cmd := exec.Command(
		"docker", "run", "-d",
		"--name", containerName,
		"--network", "test-net",
		"-v", fmt.Sprintf("%s:/usr/share/nginx/html:ro", hostVolumePath),
		"autotest-web-server",
	)

	output, err := cmd.CombinedOutput()
	if err != nil {
		return "", fmt.Errorf("run web container error: %v, output: %s", err, string(output))
	}

	log.Printf("✅ Web container %s started, waiting for nginx...", containerName)
	time.Sleep(3 * time.Second)

	return containerName, nil
}

func RunCypressContainer(jobID, testType string) ([]byte, error) {
	containerName := fmt.Sprintf("web-%s", jobID)

	if testType == "" {
		testType = "preland"
	}
	specPath := "cypress/e2e/" + testType + "/**/*.cy.js"

	log.Printf("🧪 Running Cypress: spec=%s baseUrl=http://%s:3000", specPath, containerName)

	// Передаём параметры БД из env worker-контейнера в Cypress
	dbHost     := os.Getenv("DB_HOST")
	dbPort     := os.Getenv("DB_PORT")
	dbName     := os.Getenv("DB_NAME")
	dbUser     := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")

	if dbHost == "" { dbHost = "db" }
	if dbPort == "" { dbPort = "5432" }
	if dbName == "" { dbName = "testresults" }
	if dbUser == "" { dbUser = "testuser" }
	if dbPassword == "" { dbPassword = "testpass" }

	cmd := exec.Command(
		"docker", "run", "--rm",
		"--network", "test-net",
		"-e", fmt.Sprintf("BASE_URL=http://%s:3000", containerName),
		"-e", fmt.Sprintf("TARGET_URL=http://%s:3000", containerName),
		"-e", fmt.Sprintf("ARCHIVE_ID=%s", jobID),
		"-e", fmt.Sprintf("DB_HOST=%s", dbHost),
		"-e", fmt.Sprintf("DB_PORT=%s", dbPort),
		"-e", fmt.Sprintf("DB_NAME=%s", dbName),
		"-e", fmt.Sprintf("DB_USER=%s", dbUser),
		"-e", fmt.Sprintf("DB_PASSWORD=%s", dbPassword),
		"autotest-cypress-runner",
		"cypress", "run",
		"--spec", specPath,
	)

	output, err := cmd.CombinedOutput()
	if err != nil {
		return output, fmt.Errorf("cypress run error: %v", err)
	}

	return output, nil
}

func StopContainer(name string) error {
	cmd := exec.Command("docker", "rm", "-f", name)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("stop container error: %v, output: %s", err, string(output))
	}
	return nil
}
