-- SQL запросы для проверки созданных индексов

-- Проверить индексы для DriverApplication
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'DriverApplication' 
ORDER BY indexname;

-- Проверить индексы для FreightRequest
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'FreightRequest' 
ORDER BY indexname;

-- Проверить индексы для Truck
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'Truck' 
ORDER BY indexname;

-- Общая статистика индексов
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN ('DriverApplication', 'FreightRequest', 'ContactRequest', 'Truck')
ORDER BY tablename, indexname;
