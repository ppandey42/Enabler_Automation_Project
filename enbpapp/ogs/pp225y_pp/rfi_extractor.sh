#!/bin/bash

# RFI Data Extractor Script
# Extracts RFI data from CM database and formats according to specifications

# Source the environment setup
if [ -f "GN1SetAllConnPrm" ]; then
    . ./GN1SetAllConnPrm
else
    echo "Error: GN1SetAllConnPrm file not found. Please ensure it's in the current directory."
    exit 1
fi

# Check if required environment variables are set
if [ -z "$APP_ORA_USER" ] || [ -z "$APP_ORA_PASS" ] || [ -z "$APP_DB_INST" ]; then
    echo "Error: Required environment variables not set. Please run GN1SetAllConnPrm first."
    exit 1
fi

echo "=========================================="
echo "       RFI Data Extraction Tool"
echo "=========================================="
echo "Database: CM (${APP_DB_INST})"
echo "User: ${APP_ORA_USER}"
echo "Date: $(date)"
echo "=========================================="

# Function to execute SQL and format output
execute_rfi_query() {
    local cycle_id=$1
    
    echo "Processing Cycle ID: $cycle_id"
    echo "----------------------------------------"
    
    # Main SQL query
    sqlplus -s "${APP_ORA_USER}/${APP_ORA_PASS}@${APP_DB_INST}" << EOF
SET PAGESIZE 0
SET FEEDBACK OFF
SET HEADING OFF
SET LINESIZE 1000
SET TRIMOUT ON

WITH rfi_data AS (
    SELECT 
        rs.cycle_id,
        rs.rfi_id,
        rs.ban,
        rs.status,
        cc.cycle_name,
        cc.start_date,
        cc.end_date
    FROM lspappc.uverse_cycle_rfi_status rs
    JOIN lspappo.bl1_cycle_control cc ON rs.cycle_id = cc.cycle_id
    WHERE rs.cycle_id = $cycle_id
    ORDER BY rs.rfi_id, rs.ban
)
SELECT 
    'Cycle ID: ' || cycle_id || ' | ' ||
    'Cycle Name: ' || cycle_name || ' | ' ||
    'Period: ' || TO_CHAR(start_date, 'DD-MON-YYYY') || ' to ' || TO_CHAR(end_date, 'DD-MON-YYYY') || CHR(10) ||
    'RFI ID: ' || rfi_id || ' | ' ||
    'Status: ' || status || CHR(10) ||
    'BANs: ' || LISTAGG(ban, ', ') WITHIN GROUP (ORDER BY ban) || CHR(10) ||
    '----------------------------------------'
FROM rfi_data
GROUP BY cycle_id, cycle_name, start_date, end_date, rfi_id, status
ORDER BY rfi_id;

EOF
}

# Function to get available cycles
get_available_cycles() {
    echo "Available Cycles:"
    echo "=================="
    
    sqlplus -s "${APP_ORA_USER}/${APP_ORA_PASS}@${APP_DB_INST}" << EOF
SET PAGESIZE 0
SET FEEDBACK OFF
SET HEADING OFF
SET LINESIZE 100

SELECT DISTINCT 
    cc.cycle_id || ' - ' || cc.cycle_name || ' (' || 
    TO_CHAR(cc.start_date, 'DD-MON-YY') || ' to ' || 
    TO_CHAR(cc.end_date, 'DD-MON-YY') || ')'
FROM lspappo.bl1_cycle_control cc
JOIN lspappc.uverse_cycle_rfi_status rs ON cc.cycle_id = rs.cycle_id
ORDER BY cc.cycle_id DESC;

EOF
}

# Main execution
echo ""
echo "Available cycles in CM database:"
get_available_cycles

echo ""
echo "Enter Cycle ID to extract RFI data (or 'q' to quit): "
read -r cycle_input

if [ "$cycle_input" = "q" ] || [ "$cycle_input" = "Q" ]; then
    echo "Exiting..."
    exit 0
fi

# Validate input is numeric
if ! [[ "$cycle_input" =~ ^[0-9]+$ ]]; then
    echo "Error: Please enter a valid numeric Cycle ID"
    exit 1
fi

# Check if cycle exists
cycle_check=$(sqlplus -s "${APP_ORA_USER}/${APP_ORA_PASS}@${APP_DB_INST}" << EOF
SET PAGESIZE 0
SET FEEDBACK OFF
SET HEADING OFF

SELECT COUNT(*)
FROM lspappo.bl1_cycle_control cc
JOIN lspappc.uverse_cycle_rfi_status rs ON cc.cycle_id = rs.cycle_id
WHERE cc.cycle_id = $cycle_input;

EOF
)

if [ "$cycle_check" -eq 0 ]; then
    echo "Error: No RFI data found for Cycle ID $cycle_input"
    exit 1
fi

echo ""
echo "Extracting RFI data for Cycle ID: $cycle_input"
echo "=============================================="

# Execute the main query
execute_rfi_query "$cycle_input"

echo ""
echo "=============================================="
echo "RFI Data extraction completed successfully!"
echo "=============================================="