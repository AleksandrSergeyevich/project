package dto

// JobResponse — краткий ответ для списка (GET /jobs)
// Структура: id | id_archive | author | name | status | type | created_at
type JobResponse struct {
	ID        string `json:"id"`
	ArchiveID string `json:"id_archive"`
	Author    string `json:"author"`
	Name      string `json:"name"`
	State     string `json:"status"`
	Type      string `json:"type"`
	CreatedAt string `json:"created_at"`
}

// TestSuiteResult — результат одного suite в детальном ответе
type TestSuiteResult struct {
	SuiteID      int     `json:"suite_id"`
	SuiteTitle   string  `json:"suite_title"`
	State        string  `json:"state"`
	ErrorMessage *string `json:"error_message"`
}

// JobDetailResponse — детальный ответ для конкретного теста (GET /jobs?id=...)
type JobDetailResponse struct {
	ID        string            `json:"id"`
	ArchiveID string            `json:"id_archive"`
	ResultID  string            `json:"result_id"`
	Name      string            `json:"name"`
	Author    string            `json:"author"`
	State     string            `json:"status"`
	Type      string            `json:"type"`
	CreatedAt string            `json:"created_at"`
	Results   []TestSuiteResult `json:"results"`
}
