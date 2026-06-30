-- Montreal / Quebec locale seed updates (Phase A2)
-- Converts sample data from US/Illinois to Montreal, CAD market defaults

-- Staff phones → Montreal area codes
UPDATE users SET phone = '514-555-0' || printf('%03d', id) WHERE phone LIKE '555-%';

-- Clients → Montréal, QC with Canadian postal codes
UPDATE clients SET
    state = 'QC',
    city = 'Montréal',
    address = CASE id
        WHEN 1 THEN '3847 boulevard Saint-Laurent'
        WHEN 2 THEN '4521 avenue du Parc'
        WHEN 3 THEN '1200 rue Sainte-Catherine Ouest'
        WHEN 4 THEN '890 rue Sherbrooke Est'
        WHEN 5 THEN '2105 rue Ontario Est'
        WHEN 6 THEN '1567 chemin de la Côte-des-Neiges'
        WHEN 7 THEN '3300 avenue Papineau'
        WHEN 8 THEN '445 rue Beaubien Est'
        WHEN 9 THEN '1789 boulevard Rosemont'
        WHEN 10 THEN '2560 rue Rachel Est'
        ELSE '1000 rue Saint-Denis'
    END,
    zip_code = CASE (id - 1) % 10
        WHEN 0 THEN 'H2X 1Y4'
        WHEN 1 THEN 'H3A 1B2'
        WHEN 2 THEN 'H2Z 1G1'
        WHEN 3 THEN 'H1W 1A1'
        WHEN 4 THEN 'H2K 1A1'
        WHEN 5 THEN 'H3G 1M8'
        WHEN 6 THEN 'H2J 1K3'
        WHEN 7 THEN 'H2H 1P3'
        WHEN 8 THEN 'H2S 1Z4'
        ELSE 'H1T 1A1'
    END,
    phone = '514-555-' || printf('%04d', 1000 + id)
WHERE state = 'IL' OR zip_code LIKE '627%';

-- Suppliers → Montréal
UPDATE suppliers SET
    state = 'QC',
    city = 'Montréal',
    address = '5000 boulevard Métropolitain Est',
    zip_code = 'H1P 1X5',
    phone = '514-555-2' || printf('%03d', id)
WHERE state = 'IL';

-- Vehicle odometer: miles → kilometres (stored value represents km going forward)
UPDATE vehicles SET mileage = CAST(ROUND(mileage * 1.60934) AS INTEGER)
WHERE mileage IS NOT NULL AND mileage > 0;

-- Quebec-style licence plates (e.g. A12 3B4)
UPDATE vehicles SET license_plate =
    substr('ABCDEFGHJKLMNPRSTUVWXYZ', ((id - 1) % 23) + 1, 1) ||
    printf('%02d', (id * 3) % 100) || ' ' ||
    substr('ABCDEFGHJKLMNPRSTUVWXYZ', ((id * 7) % 23) + 1, 1) ||
    printf('%02d', (id * 11) % 100)
WHERE license_plate IS NOT NULL;

-- Service history mileage → km
UPDATE vehicle_service_history SET
    mileage = CAST(ROUND(mileage * 1.60934) AS INTEGER),
    next_service_due = CAST(ROUND(next_service_due * 1.60934) AS INTEGER)
WHERE mileage IS NOT NULL AND mileage > 0;

-- Work order text referencing miles → km
UPDATE work_orders SET recommendations = REPLACE(recommendations, 'miles', 'km') WHERE recommendations LIKE '%miles%';
UPDATE work_orders SET work_performed = REPLACE(work_performed, 'miles', 'km') WHERE work_performed LIKE '%miles%';
