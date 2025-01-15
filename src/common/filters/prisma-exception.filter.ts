import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
    catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR; // 기본 상태 코드
        let message = '데이터베이스 오류가 발생했습니다.';

        // 예외 코드에 따라 상태 및 메시지 설정
        switch (exception.code) {
            case 'P2000':
                status = HttpStatus.BAD_REQUEST; // 400
                message = '제공된 값이 열의 유형에 비해 너무 깁니다.';
                break;
            case 'P2001':
                status = HttpStatus.NOT_FOUND; // 404
                message = '검색한 레코드가 존재하지 않습니다.';
                break;
            case 'P2002':
                status = HttpStatus.CONFLICT; // 409
                message = '고유 제약 조건 위반이 발생했습니다.';
                break;
            case 'P2003':
                status = HttpStatus.CONFLICT; // 409
                message = '외래 키 제약 조건 위반이 발생했습니다.';
                break;
            case 'P2004':
                status = HttpStatus.CONFLICT; // 409
                message = '데이터베이스에서 제약 조건이 실패했습니다.';
                break;
            case 'P2005':
                status = HttpStatus.BAD_REQUEST; // 400
                message = '저장된 값이 필드의 유형에 대해 유효하지 않습니다.';
                break;
            case 'P2006':
                status = HttpStatus.BAD_REQUEST; // 400
                message = '제공된 값이 유효하지 않습니다.';
                break;
            case 'P2007':
                status = HttpStatus.BAD_REQUEST; // 400
                message = '데이터 검증 오류가 발생했습니다.';
                break;
            case 'P2008':
                status = HttpStatus.BAD_REQUEST; // 400
                message = '쿼리 구문 분석에 실패했습니다.';
                break;
            case 'P2009':
                status = HttpStatus.BAD_REQUEST; // 400
                message = '쿼리 유효성 검사에 실패했습니다.';
                break;
            case 'P2010':
                status = HttpStatus.BAD_REQUEST; // 400
                message = '로우 쿼리 실패했습니다.';
                break;
            case 'P2011':
                status = HttpStatus.BAD_REQUEST; // 400
                message = 'NULL 제약 조건 위반이 발생했습니다.';
                break;
            case 'P2012':
                status = HttpStatus.BAD_REQUEST; // 400
                message = '필수 값이 누락되었습니다.';
                break;
            case 'P2013':
                status = HttpStatus.BAD_REQUEST; // 400
                message = '필드에 대한 필수 인수가 누락되었습니다.';
                break;
            case 'P2014':
                status = HttpStatus.BAD_REQUEST; // 400
                message = '관계 위반이 발생했습니다.';
                break;
            case 'P2015':
                status = HttpStatus.NOT_FOUND; // 404
                message = '관련 레코드를 찾을 수 없습니다.';
                break;
            case 'P2016':
                status = HttpStatus.BAD_REQUEST; // 400
                message = '쿼리 해석 오류가 발생했습니다.';
                break;
            case 'P2017':
                status = HttpStatus.BAD_REQUEST; // 400
                message = '관계의 레코드가 연결되어 있지 않습니다.';
                break;
            case 'P2018':
                status = HttpStatus.NOT_FOUND; // 404
                message = '필수 연결된 레코드를 찾을 수 없습니다.';
                break;
            case 'P2019':
                status = HttpStatus.BAD_REQUEST; // 400
                message = '입력 오류가 발생했습니다.';
                break;
            case 'P2020':
                status = HttpStatus.BAD_REQUEST; // 400
                message = '유형에 대한 값이 범위를 초과했습니다.';
                break;
            case 'P2021':
                status = HttpStatus.NOT_FOUND; // 404
                message = '현재 데이터베이스에 테이블이 존재하지 않습니다.';
                break;
            case 'P2022':
                status = HttpStatus.NOT_FOUND; // 404
                message = '현재 데이터베이스에 열이 존재하지 않습니다.';
                break;
            case 'P2023':
                status = HttpStatus.BAD_REQUEST; // 400
                message = '열 데이터가 일관되지 않습니다.';
                break;
            case 'P2024':
                status = HttpStatus.SERVICE_UNAVAILABLE; // 503
                message = '연결 풀에서 새 연결을 가져오는 데 시간이 초과되었습니다.';
                break;
            case 'P2025':
                status = HttpStatus.NOT_FOUND; // 404
                message = '필요한 레코드가 발견되지 않았습니다.';
                break;
            case 'P2026':
                status = HttpStatus.BAD_REQUEST; // 400
                message = '현재 데이터베이스가 쿼리에서 사용된 기능을 지원하지 않습니다.';
                break;
            case 'P2027':
                status = HttpStatus.BAD_REQUEST; // 400
                message = '쿼리 실행 중 데이터베이스에서 여러 오류가 발생했습니다.';
                break;
            case 'P2028':
                status = HttpStatus.BAD_REQUEST; // 400
                message = '트랜잭션 API 오류가 발생했습니다.';
                break;
            case 'P2029':
                status = HttpStatus.BAD_REQUEST; // 400
                message = '쿼리 매개변수 제한 초과 오류가 발생했습니다.';
                break;
            case 'P2030':
                status = HttpStatus.BAD_REQUEST; // 400
                message = 'full text 인덱스를 찾을 수 없습니다.';
                break;
            case 'P2033':
                status = HttpStatus.BAD_REQUEST; // 400
                message = '쿼리에서 사용된 숫자가 64비트 부호 있는 정수에 맞지 않습니다.';
                break;
            case 'P2034':
                status = HttpStatus.BAD_REQUEST; // 400
                message = '트랜잭션이 쓰기 충돌 또는 교착 상태로 인해 실패했습니다.';
                break;
            case 'P2035':
                status = HttpStatus.BAD_REQUEST; // 400
                message = '데이터베이스에서 단언 위반이 발생했습니다.';
                break;
            case 'P2036':
                status = HttpStatus.BAD_REQUEST; // 400
                message = '외부 커넥터에서 오류가 발생했습니다.';
                break;
            case 'P2037':
                status = HttpStatus.BAD_REQUEST; // 400
                message = '열 수가 너무 많습니다.';
                break;
            default:
                break;
        }

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            message,
            requestBody: request.body,
        });
    }
}
